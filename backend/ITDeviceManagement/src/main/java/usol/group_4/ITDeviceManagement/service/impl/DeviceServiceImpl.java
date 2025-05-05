package usol.group_4.ITDeviceManagement.service.impl;

import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import usol.group_4.ITDeviceManagement.DTO.request.DeviceCreateRequest;
import usol.group_4.ITDeviceManagement.DTO.request.DeviceListRequest;
import usol.group_4.ITDeviceManagement.DTO.request.DeviceUpdateRequest;
import usol.group_4.ITDeviceManagement.DTO.request.DeviceUserRequest;
import usol.group_4.ITDeviceManagement.DTO.response.DeviceAssignmentResponse;
import usol.group_4.ITDeviceManagement.DTO.response.DeviceResponse;
import usol.group_4.ITDeviceManagement.DTO.response.PageResponse;
import usol.group_4.ITDeviceManagement.DTO.response.UserResponse;
import usol.group_4.ITDeviceManagement.constant.AssignmentStatus;
import usol.group_4.ITDeviceManagement.constant.StatusDevice;
import usol.group_4.ITDeviceManagement.converter.PageResponseConverter;
import usol.group_4.ITDeviceManagement.entity.*;
import usol.group_4.ITDeviceManagement.exception.CustomResponseException;
import usol.group_4.ITDeviceManagement.exception.ErrorCode;
import usol.group_4.ITDeviceManagement.repository.*;
import usol.group_4.ITDeviceManagement.service.IDeviceService;
import usol.group_4.ITDeviceManagement.service.IQRService;
import usol.group_4.ITDeviceManagement.service.IUserService;

import javax.persistence.EntityNotFoundException;
import java.io.File;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DeviceServiceImpl implements IDeviceService {
    @Autowired
    private DeviceRepository deviceRepository;
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
    @Autowired
    private DeviceAssignmentRepository deviceAssignmentRepository ;
    @Autowired
    private PdfService pdfService;
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

        device.setCategory(category) ;

        String qrCodeText = String.format(
                "Accounting code: %s \n" +
                        "Serial number: %s \n" +
                        "Location: %s \n" +
                        "Notes: %s \n" +
                        "Specification: %s \n" +
                        "Category: %s \n",
                device.getAccountingCode() != null ? device.getAccountingCode() : "",
                device.getSerialNumber() != null ? device.getSerialNumber() : "",
                device.getLocation() != null ? device.getLocation() : "",
                device.getNotes() != null ? device.getNotes() : "",
                device.getSpecification() != null ? device.getSpecification() : "",
                device.getCategory() != null ? device.getCategory().getName() : "N/A"
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

        // 2. Tìm người dùng dựa trên owner_id
        Optional<User> owner = userRepository.findById(deviceUserRequest.getOwner_id());
        if (owner.isEmpty()) {
            throw new CustomResponseException(HttpStatus.NOT_FOUND, ErrorCode.NON_EXISTING_ID_OWNER.getMessage());
        }

        // 3. Kiểm tra xem thiết bị đã được gán cho người dùng nào chưa
        List<DeviceAssignment> assignments = deviceAssignmentRepository.findByDeviceIdOrderByHandoverDateDesc(device.getId());
        if (!assignments.isEmpty() && assignments.get(0).getStatus() == AssignmentStatus.ASSIGNED) {
            throw new CustomResponseException(HttpStatus.CONFLICT, ErrorCode.USED_DEVICE.getMessage());
        }

        // 4. Tạo bản ghi gán thiết bị trong DeviceAssignment
        DeviceAssignment assignment = DeviceAssignment.builder()
                .device(device)
                .toUser(owner.get())
                .quantity(1) // Giả sử quantity là 1, bạn có thể lấy từ request nếu cần
                .handoverDate(LocalDateTime.now())
                .handoverPerson(getMyInfo().getLastname() + " " + getMyInfo().getFirstname())
                .status(AssignmentStatus.PENDING)
                .build();
        DeviceAssignment savedAssignment = deviceAssignmentRepository.save(assignment);
        // 5. Tạo biên bản bàn giao (PDF) và lưu đường dẫn vào assignment
        try {
            List<Device> devices = Arrays.asList(device);
            String pdfPath = pdfService.generateHandoverPdf(savedAssignment, devices,owner.get().getFirstname(), null, null);
            savedAssignment.setPdfPath(pdfPath);
            deviceAssignmentRepository.save(savedAssignment);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate handover PDF", e);
        }
        // 5. Cập nhật trạng thái thiết bị
        device.setStatus(StatusDevice.CHO_XAC_NHAN.name());

        // 6. Tạo mã QR và lưu vào identifyCode
        String qrCodeString = getQrCodeText(owner, device);
        byte[] qrCodeImage;
        try {
            qrCodeImage = qrService.generateQRCode(qrCodeString, 300, 300);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate QR code", e);
        }
        String qrCodeBase64 = qrService.generateQRCodeBase64(qrCodeImage);
        device.setIdentifyCode(qrCodeBase64);

        // 7. Lưu thiết bị và trả về response
        return mapToResponse(deviceRepository.save(device));
    }

    @Override
    public List<Object[]> getDeviceQuantityByStatus() {
        return deviceRepository.getDeviceQuantityByStatus();
    }

    @Override
    public DeviceResponse transferUsedDevice(DeviceUserRequest deviceUserRequest) {
        Device device = deviceRepository.findBySerialNumber(deviceUserRequest.getSerial_number());
        // xử lý giao sang người dùng
//        Optional<Owner> owner = ownerRepository.findById(deviceUserRequest.getOwner_id());
//        Optional<User> owner = userRepository.findById(deviceUserRequest.getOwner_id()) ;
//        if (owner.isEmpty()) {
//            throw new CustomResponseException(HttpStatus.NOT_FOUND, ErrorCode.NON_EXISTING_ID_OWNER.getMessage());
//        }
//        if (device.getSerialNumber().isEmpty()) {
//            throw new CustomResponseException(HttpStatus.NOT_FOUND, ErrorCode.NON_EXISTING_ID_DEVICE.getMessage());
//        }
//        if (device.getOwner_id() != null && !device.getOwner_id().isEmpty()) {
//            throw new CustomResponseException(HttpStatus.CONFLICT, ErrorCode.USED_DEVICE.getMessage());
//        }
//        device.setUser(owner.get());
//        device.setStatus(StatusDevice.DA_SU_DUNG.name());
//
//        String qrCodeString = getQrCodeText(owner, device);
//        byte[] qrCodeImage = null;
//        try {
//            qrCodeImage = qrService.generateQRCode(qrCodeString, 300, 300);
//        } catch (Exception e) {
//            throw new RuntimeException(e);
//        }
//        String qrCodeBase64 = qrService.generateQRCodeBase64(qrCodeImage);
//        device.setIdentifyCode(qrCodeBase64);


        return mapToResponse(deviceRepository.save(device));
    }

    @Override
    public DeviceResponse transferEmptyStatusDevice(String serialNumber) {
        Device device = deviceRepository.findBySerialNumber(serialNumber);

        if (device.getSerialNumber().isEmpty()) {
            throw new CustomResponseException(HttpStatus.NOT_FOUND, ErrorCode.NON_EXISTING_ID_DEVICE.getMessage());
        }
        // 2. Tìm bản ghi gán mới nhất trong DeviceAssignment
        Optional<DeviceAssignment> assignmentOpt = deviceAssignmentRepository.findTopByDeviceIdOrderByHandoverDateDesc(device.getId());
        if (assignmentOpt.isEmpty() ||
                (assignmentOpt.get().getStatus() != AssignmentStatus.ASSIGNED &&
                        assignmentOpt.get().getStatus() != AssignmentStatus.PENDING)) {
            throw new CustomResponseException(HttpStatus.BAD_REQUEST, "Device is not currently assigned to any user");
        }

        // 3. Xóa bản ghi gán trong DeviceAssignment
        DeviceAssignment currentAssignment = assignmentOpt.get();
        deviceAssignmentRepository.delete(currentAssignment);


        // 5. Cập nhật trạng thái thiết bị
        device.setStatus(StatusDevice.CHUA_SU_DUNG.name());

        // 6. Tạo mã QR mới và lưu vào identifyCode
        String qrCodeText = getQrCodeText(device);
        byte[] qrCodeImage;
        try {
            qrCodeImage = qrService.generateQRCode(qrCodeText, 300, 300);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate QR code", e);
        }
        String qrCodeBase64 = qrService.generateQRCodeBase64(qrCodeImage);
        device.setIdentifyCode(qrCodeBase64);

        // 7. Lưu thiết bị và trả về response
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
    // hàm user xác nhận vật tư
    @Override
    public List<DeviceResponse> approveDeviceAssignment(List<Long> deviceIds) {
        List<DeviceResponse> res = new ArrayList<>() ;
        for ( Long deviceId : deviceIds) {
            Optional<DeviceAssignment> assignmentOpt = deviceAssignmentRepository
                    .findTopByDeviceIdAndToUserIdAndStatusOrderByHandoverDateDesc(deviceId,getMyInfo().getId(), AssignmentStatus.PENDING);
            if (assignmentOpt.isEmpty()) {
                throw new CustomResponseException(HttpStatus.BAD_REQUEST, "No pending assignment found for this user and device");
            }

            // 2. Cập nhật trạng thái của DeviceAssignment thành ASSIGNED
            DeviceAssignment assignment = assignmentOpt.get();
            assignment.setStatus(AssignmentStatus.ASSIGNED);
            deviceAssignmentRepository.save(assignment);

            // 3. Cập nhật trạng thái thiết bị thành IN_USE
            Device device = assignment.getDevice();
            device.setStatus(StatusDevice.DA_SU_DUNG.name());
            deviceRepository.save(device);
            try {
                String receiverName = getMyInfo().getFirstname();

                List<Device> devices = List.of(device);
                String updatedPdfPath = pdfService.updateHandoverPdf(assignment, devices, receiverName, getMyInfo().getLastname() + " " +getMyInfo().getFirstname(), null);
                assignment.setPdfPath(updatedPdfPath);
                deviceAssignmentRepository.save(assignment);
            } catch (Exception e) {
                throw new RuntimeException("Failed to update handover PDF", e);
            }
            DeviceResponse ad =  mapToResponse(device) ;
            res.add(ad) ;
        }
        // 5. Trả về response
        return res;
    }
    public List<DeviceAssignmentResponse> getAssignmentsByUserId(AssignmentStatus status, String serialNumber) {
        List<DeviceAssignment> assignments = deviceAssignmentRepository
                .findAssignmentsByUserIdAndFilters(getMyInfo().getId(), status, serialNumber);

        return assignments.stream()
                .map(da -> DeviceAssignmentResponse.builder()
                        .id(da.getId())
                        .deviceId(da.getDevice().getId())
                        .serialNumber(da.getDevice().getSerialNumber())
                        .manufacturer(da.getDevice().getManufacture())
                        .userId(da.getToUser().getId())
                        .quantity(da.getQuantity())
                        .handoverDate(da.getHandoverDate())
                        .status(da.getStatus())
                        .pdfPath(da.getPdfPath())
                        .build())
                .collect(Collectors.toList());
    }
    @Override
    public DeviceAssignmentResponse rejectDeviceAssignment(Long assignmentId) {
        DeviceAssignment assignment = deviceAssignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy bản ghi bàn giao với ID: " + assignmentId));
        // Lưu thông tin trước khi xóa để trả về
        Device device = deviceRepository.findBySerialNumber(assignment.getDevice().getSerialNumber());
        device.setStatus(StatusDevice.CHUA_SU_DUNG.name());
        deviceRepository.save(device) ;
        DeviceAssignmentResponse response = DeviceAssignmentResponse.builder()
                .id(assignment.getId())
                .deviceId(assignment.getDevice().getId())
                .serialNumber(assignment.getDevice().getSerialNumber())
                .manufacturer(assignment.getDevice().getManufacture())
                .userId(assignment.getToUser().getId())
                .quantity(assignment.getQuantity())
                .handoverDate(assignment.getHandoverDate())
                .pdfPath(assignment.getPdfPath())
                .status(AssignmentStatus.REJECTED) // Trạng thái trước khi xóa
                .build();

        // Xóa bản ghi
        assignment.setStatus(AssignmentStatus.REJECTED);
        deviceAssignmentRepository.save(assignment);
        return response;
    }

    @Override
    public DeviceAssignmentResponse returnDeviceAssignment(Long assignmentId) {
        DeviceAssignment assignment = deviceAssignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy bản ghi bàn giao với ID: " + assignmentId));

        // Cập nhật trạng thái
        assignment.setStatus(AssignmentStatus.RETURNED);
//        DeviceAssignment updatedAssignment = deviceAssignmentRepository.save(assignment);
        Device device = deviceRepository.findBySerialNumber(assignment.getDevice().getSerialNumber());
        device.setStatus(StatusDevice.CHUA_SU_DUNG.name());
        deviceRepository.save(device) ;
        String receiverName = getMyInfo().getFirstname();
        try {
            List<Device> devices = List.of(device);
            String updatedPdfPath = pdfService.updateHandoverPdf(assignment, devices, receiverName, getMyInfo().getLastname() + " " +getMyInfo().getFirstname(), getMyInfo().getLastname() + " " +getMyInfo().getFirstname());
            assignment.setPdfPath(updatedPdfPath);
            deviceAssignmentRepository.save(assignment);
        } catch (Exception e) {
            throw new RuntimeException("Failed to update handover PDF", e);
        }
        // Trả về thông tin bản ghi đã cập nhật
        return DeviceAssignmentResponse.builder()
                .id(assignment.getId())
                .deviceId(assignment.getDevice().getId())
                .serialNumber(assignment.getDevice().getSerialNumber())
                .manufacturer(assignment.getDevice().getManufacture())
                .userId(assignment.getToUser().getId())
                .quantity(assignment.getQuantity())
                .handoverDate(assignment.getHandoverDate())
                .status(assignment.getStatus())
                .pdfPath(assignment.getPdfPath())
                .build();
    }
    @Override
    public FileSystemResource downloadHandoverPdf(Long assignmentId) {
        DeviceAssignment assignment = deviceAssignmentRepository.findById(assignmentId).get();
        if (assignment == null) {
            throw new CustomResponseException(HttpStatus.NOT_FOUND, "Không tìm thấy bản ghi bàn giao!");
        }

        // 3. Kiểm tra file PDF
        String pdfPath = assignment.getPdfPath();
        if (pdfPath == null) {
            throw new CustomResponseException(HttpStatus.NOT_FOUND, "File PDF không tồn tại!");
        }

        File file = new File(pdfPath);
        if (!file.exists()) {
            throw new CustomResponseException(HttpStatus.NOT_FOUND, "File PDF không tồn tại trên server!");
        }

        // 4. Trả về file PDF dưới dạng FileSystemResource
        return new FileSystemResource(file);
    }

    public User getMyInfo() {
        var context = SecurityContextHolder.getContext() ;
        String name = context.getAuthentication().getName() ;
        User user = Optional.ofNullable(userRepository.findByUsername(name)).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, ErrorCode.NON_EXISTING_ID_USER.getMessage()));
        return user ;
    }

}
