package usol.group_4.ITDeviceManagement.service.impl;

import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import usol.group_4.ITDeviceManagement.DTO.request.DeviceCreateRequest;
import usol.group_4.ITDeviceManagement.DTO.request.DeviceListRequest;
import usol.group_4.ITDeviceManagement.DTO.request.DeviceUpdateRequest;
import usol.group_4.ITDeviceManagement.DTO.request.DeviceUserRequest;
import usol.group_4.ITDeviceManagement.DTO.response.DeviceResponse;
import usol.group_4.ITDeviceManagement.DTO.response.PageResponse;
import usol.group_4.ITDeviceManagement.constant.DeviceStatus;
import usol.group_4.ITDeviceManagement.constant.StatusDevice;
import usol.group_4.ITDeviceManagement.converter.PageResponseConverter;
import usol.group_4.ITDeviceManagement.entity.Category;
import usol.group_4.ITDeviceManagement.entity.Device;
import usol.group_4.ITDeviceManagement.entity.Owner;
import usol.group_4.ITDeviceManagement.entity.User;
import usol.group_4.ITDeviceManagement.exception.CustomResponseException;
import usol.group_4.ITDeviceManagement.exception.ErrorCode;
import usol.group_4.ITDeviceManagement.repository.CategoryRepository;
import usol.group_4.ITDeviceManagement.repository.DeviceRepository;
import usol.group_4.ITDeviceManagement.repository.OwnerRepository;
import usol.group_4.ITDeviceManagement.repository.UserRepository;
import usol.group_4.ITDeviceManagement.service.IDeviceService;
import usol.group_4.ITDeviceManagement.service.IQRService;
import usol.group_4.ITDeviceManagement.service.IUserService;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DeviceServiceImpl implements IDeviceService {
    @Autowired
    private DeviceRepository deviceRepository;
    @Autowired
    private OwnerRepository ownerRepository;
    @Autowired
    private CategoryRepository categoryRepository;
    @Autowired
    private IUserService userService;
    @Autowired
    private ModelMapper modelMapper;
    @Autowired
    private IQRService qrService;
    @Autowired
    private UserRepository userRepository ;

    private final PageResponseConverter<DeviceResponse> pageResponseConverter;

    @Override
    public DeviceResponse getDeviceResponseById(Long id) {
        var device = deviceRepository.findById(id).
                orElseThrow(() ->
                        new CustomResponseException(HttpStatus.NOT_FOUND, ErrorCode.NON_EXISTING_ID_DEVICE.getMessage())
                );
        return mapToResponse(device);
    }

    @Override
    public PageResponse<DeviceResponse> getDevices(DeviceListRequest request) {
        int pageNumber = request.getPage() > 0 ? request.getPage() - 1 : 0;
        int pageSize = request.getPageSize();

        List<Device> devices = deviceRepository.getDevices(request);
        var deviceResponse = devices.stream().map(this::mapToResponse).collect(Collectors.toList());

        Long total = deviceRepository.countTotalDevices(request);

        Pageable pageable = PageRequest.of(pageNumber, pageSize);

        Page<DeviceResponse> page = new PageImpl<>(deviceResponse, pageable, total);

        return pageResponseConverter.mapToPageResponse(page);
    }

    @Override
    public DeviceResponse createDevice(DeviceCreateRequest request) {
        validateDeviceCreateRequest(request);

        Device device = modelMapper.map(request, Device.class);
        Category category = request.getCategoryId() != null ? categoryRepository.findById(request.getCategoryId()).orElse(null) : null;
        User user = userService.getCurrentUser();


        device.setCategory(category);
        device.setUser(user);
        device.setOwner_id("");
        String ownerName = "";
        if (device.getOwner_id() != null && device.getOwner_id() != "") {
            Optional<Owner> ownerById = ownerRepository.findById(device.getOwner_id());
            ownerName = ownerById.get().getName();
        }

        String qrCodeText = String.format(
                "Accounting code: %s \n" +
                        "Serial number: %s \n" +
                        "Location: %s \n" +
                        "Notes: %s \n" +
                        "Specification: %s \n" +
                        "Category: %s \n" +
                        "Owner: %s \n",
                device.getAccountingCode() != null ? device.getAccountingCode() : "",
                device.getSerialNumber() != null ? device.getSerialNumber() : "",
                device.getLocation() != null ? device.getLocation() : "",
                device.getNotes() != null ? device.getNotes() : "",
                device.getSpecification() != null ? device.getSpecification() : "",
                device.getCategory() != null ? device.getCategory().getName() : "N/A",
                ownerName
        );
        byte[] qrCodeImage = null;
        try {
            qrCodeImage = qrService.generateQRCode(qrCodeText, 300, 300);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        String qrCodeBase64 = qrService.generateQRCodeBase64(qrCodeImage);

        device.setIdentifyCode(qrCodeBase64);
        device.setStatus(StatusDevice.CHUA_SU_DUNG.name());

        device = deviceRepository.save(device);

        return mapToResponse(device);
    }

    @Override
    public DeviceResponse updateDevice(DeviceUpdateRequest request) {
        validateDeviceUpdateRequest(request);

        Device device = deviceRepository.findById(request.getId()).orElseThrow();
        Category category = request.getCategoryId() != null ? categoryRepository.findById(request.getCategoryId()).orElse(null) : null;

        device.setCategory(category);
        device.setAccountingCode(request.getAccountingCode());
        device.setManufacture(request.getManufacture());
        device.setExpirationDate(request.getExpirationDate());
        device.setNotes(request.getNotes());
        device.setPurchaseDate(request.getPurchaseDate());
        device.setPurpose(request.getPurpose());
        device.setSerialNumber(request.getSerialNumber());
        device.setSpecification(request.getSpecification());

        String qrCodeString = getQrCodeText(device);
        byte[] qrCodeImage = null;
        try {
            qrCodeImage = qrService.generateQRCode(qrCodeString, 300, 300);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        String qrCodeBase64 = qrService.generateQRCodeBase64(qrCodeImage);
        device.setIdentifyCode(qrCodeBase64);

        device = deviceRepository.save(device);

        return mapToResponse(device);
    }

    @Override
    public void deleteDevice(List<Long> ids) {
        ids.forEach(this::checkDeviceExistence);
        deviceRepository.deleteAllByIdInBatch(ids);
    }

//    @Override
//    public Map<DeviceStatus, Long> getProductStatusCounts() {
//        List<Object[]> results = deviceRepository.countProductsByStatus();
//        Map<DeviceStatus, Long> statusCounts = new HashMap<>();
//        for (Object[] result : results) {
//            DeviceStatus status = (DeviceStatus) result[0];
//            Long count = (Long) result[1];
//            statusCounts.put(status, count);
//
//        }
//        return statusCounts;
//    }

    @Override
    public List<DeviceResponse> getAllDevices() {
        List<Device> devices = deviceRepository.findAll();
        List<DeviceResponse> deviceResponses = new ArrayList<>();
        for (Device device : devices) {
            DeviceResponse deviceResponse = mapToResponse(device);
            deviceResponses.add(deviceResponse);
        }
        return deviceResponses;
    }

    @Override
    public List<Object[]> countDeviceByCategory() {
        return deviceRepository.findDeviceQuantityByCategory();
    }

    @Override
    public List<Object[]> countDeviceByDepartment() {
        return deviceRepository.findDeviceQuantityByDepartment();
    }

    private void validateDeviceCreateRequest(DeviceCreateRequest request) {
        checkCategoryExistence(request.getCategoryId());
        checkDuplicateAccountingCode(request.getAccountingCode(), null);
        checkDuplicateSerialNumber(request.getSerialNumber(), null);
        validateDateCompare(request.getPurchaseDate(), request.getExpirationDate());
    }

    private void validateDeviceUpdateRequest(DeviceUpdateRequest request) {
        checkDeviceExistence(request.getId());
        checkCategoryExistence(request.getCategoryId());
        checkDuplicateAccountingCode(request.getAccountingCode(), request.getId());
        checkDuplicateSerialNumber(request.getSerialNumber(), request.getId());
        validateDateCompare(request.getPurchaseDate(), request.getExpirationDate());
    }

    private void checkDuplicateAccountingCode(String accountingCode, Long deviceId) {
        if (accountingCode == null) return;
        var device = deviceRepository.findByAccountingCode(accountingCode);
        if (device == null) return;
        if (deviceId == null) {
            throw new CustomResponseException(HttpStatus.CONFLICT, ErrorCode.EXISTING_ACCOUNTING_CODE_DEVICE.getMessage());
        } else {
            if (!deviceId.equals(device.getId())) {
                throw new CustomResponseException(HttpStatus.CONFLICT, ErrorCode.EXISTING_ACCOUNTING_CODE_DEVICE.getMessage());
            }
        }
    }

    private void checkDuplicateSerialNumber(String serialNumber, Long deviceId) {
        if (serialNumber == null) return;
        var device = deviceRepository.findBySerialNumber(serialNumber);
        if (device == null) return;
        if (deviceId == null) {
            throw new CustomResponseException(HttpStatus.CONFLICT, ErrorCode.EXISTING_SERIAL_NUMBER_DEVICE.getMessage());
        } else {
            if (!deviceId.equals(device.getId())) {
                throw new CustomResponseException(HttpStatus.CONFLICT, ErrorCode.EXISTING_SERIAL_NUMBER_DEVICE.getMessage());
            }
        }

    }

    private void checkDeviceExistence(Long deviceId) {
        if (deviceId == null) return;
        deviceRepository.findById(deviceId)
                .orElseThrow(() -> new CustomResponseException(HttpStatus.NOT_FOUND, ErrorCode.NON_EXISTING_ID_DEVICE.getMessage()));
    }

    private void checkCategoryExistence(Long categoryId) {
        if (categoryId == null) return;
        categoryRepository.findById(categoryId)
                .orElseThrow(() -> new CustomResponseException(HttpStatus.NOT_FOUND, ErrorCode.NON_EXISTING_ID_CATEGORY.getMessage()));
    }


    private DeviceResponse mapToResponse(Device device) {
        var response = modelMapper.map(device, DeviceResponse.class);
        Optional.ofNullable(response.getUser()).ifPresent(user -> user.setDevices(null));
        Optional.ofNullable(response.getUser()).ifPresent(user -> user.setRoles(null));
        Optional.ofNullable(response.getCategory()).ifPresent(user -> user.setDevices(null));
        return response;
    }


    @Override
    public Device findDeviceById(Long id) {
        Optional<Device> optionalDevice = deviceRepository.findById(id);
        return optionalDevice.orElse(null);
    }

    @Override
    public List<Object[]> searchDeviceByCustomField(String serialNumber, Date fromDate, Date toDate, Long categoryId, String ownerId, String status) {
        return deviceRepository.findByCriteria(serialNumber, fromDate, toDate, categoryId, ownerId, status);
    }


    @Override
    public List<Object[]> getDeviceBySerialNum(String serialNumber) {
        return deviceRepository.getDeviceBySerialNum(serialNumber);
    }

    @Override
    public List<Object[]> findDeviceByStatus(String status) {

        return deviceRepository.findByStatus(status);
    }

    @Override
    public DeviceResponse setDeviceForOwner(DeviceUserRequest deviceUserRequest) {
        Device device = deviceRepository.findBySerialNumber(deviceUserRequest.getSerial_number());
        // xử lý giao sang người dùng
//        Optional<Owner> owner = ownerRepository.findById(deviceUserRequest.getOwner_id());
        Optional<User> owner = userRepository.findById(deviceUserRequest.getOwner_id()) ;
        if (owner.isEmpty()) {
            throw new CustomResponseException(HttpStatus.NOT_FOUND, ErrorCode.NON_EXISTING_ID_OWNER.getMessage());
        }
        if (device.getSerialNumber().isEmpty()) {
            throw new CustomResponseException(HttpStatus.NOT_FOUND, ErrorCode.NON_EXISTING_ID_DEVICE.getMessage());
        }
        if (device.getOwner_id() != null && !device.getOwner_id().isEmpty()) {
            throw new CustomResponseException(HttpStatus.CONFLICT, ErrorCode.USED_DEVICE.getMessage());
        }
        device.setUser(owner.get());
        device.setStatus(StatusDevice.DA_SU_DUNG.name());

        String qrCodeString = getQrCodeText(owner, device);
        byte[] qrCodeImage = null;
        try {
            qrCodeImage = qrService.generateQRCode(qrCodeString, 300, 300);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        String qrCodeBase64 = qrService.generateQRCodeBase64(qrCodeImage);
        device.setIdentifyCode(qrCodeBase64);


        return mapToResponse(deviceRepository.save(device));
    }

    @Override
    public List<Object[]> getDeviceQuantityByStatus() {
        return deviceRepository.getDeviceQuantityByStatus();
    }

    @Override
    public DeviceResponse transferUsedDevice(DeviceUserRequest deviceUserRequest) {
        Device device = deviceRepository.findBySerialNumber(deviceUserRequest.getSerial_number());
        // User
        Optional<User> owner = userRepository.findById(deviceUserRequest.getOwner_id()) ;
        if (owner.isEmpty()) {
            throw new CustomResponseException(HttpStatus.NOT_FOUND, ErrorCode.NON_EXISTING_ID_OWNER.getMessage());
        }
        if (device.getSerialNumber().isEmpty()) {
            throw new CustomResponseException(HttpStatus.NOT_FOUND, ErrorCode.NON_EXISTING_ID_DEVICE.getMessage());
        }
        device.setUser(owner.get());
        String qrCodeText = getQrCodeText(owner, device);
        byte[] qrCodeImage = null;
        try {
            qrCodeImage = qrService.generateQRCode(qrCodeText, 300, 300);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        String qrCodeBase64 = qrService.generateQRCodeBase64(qrCodeImage);
        device.setIdentifyCode(qrCodeBase64);
        return mapToResponse(deviceRepository.save(device));
    }

    @Override
    public DeviceResponse transferEmptyStatusDevice(String serialNumber) {
        Device device = deviceRepository.findBySerialNumber(serialNumber);

        if (device.getSerialNumber().isEmpty()) {
            throw new CustomResponseException(HttpStatus.NOT_FOUND, ErrorCode.NON_EXISTING_ID_DEVICE.getMessage());
        }
        device.setUser(null);
        device.setStatus(StatusDevice.CHUA_SU_DUNG.name());

        String qrCodeText = getQrCodeText(device);
        byte[] qrCodeImage = null;
        try {
            qrCodeImage = qrService.generateQRCode(qrCodeText, 300, 300);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        String qrCodeBase64 = qrService.generateQRCodeBase64(qrCodeImage);
        device.setIdentifyCode(qrCodeBase64);
        return mapToResponse(deviceRepository.save(device));
    }

    private void validateDateCompare(Date from, Date to) {
        if (from == null || to == null) return;
        if (to.before(from))
            throw new CustomResponseException(HttpStatus.BAD_REQUEST, ErrorCode.INVALID_DATE_COMPARISON.getMessage());
    }
    private String getQrCodeText(Optional<User> ownerById, Device device) {
        String ownerName = ownerById.get().getLastname() + ownerById.get().getFirstname();
        String qrCodeText = String.format(
                "Accounting code: %s \n" + "Location: %s \n" + "Notes: %s \n" + "Specification: %s \n" + "Category: %s \n" + "Owner: %s \n",
                device.getAccountingCode(),
                device.getLocation(),
                device.getNotes(),
                device.getSpecification(),
                device.getCategory() != null ? device.getCategory().getName() : "N/A",
                ownerName
        );
        return qrCodeText;
    }
    private String getQrCodeText(Device device) {
        String qrCodeText = String.format(
                "Accounting code: %s \n" + "Location: %s \n" + "Notes: %s \n" + "Specification: %s \n" + "Category: %s \n" + "Owner: %s \n",
                device.getAccountingCode(),
                device.getLocation(),
                device.getNotes(),
                device.getSpecification(),
                device.getCategory() != null ? device.getCategory().getName() : "N/A",
                ""
        );
        return qrCodeText;
    }


}
