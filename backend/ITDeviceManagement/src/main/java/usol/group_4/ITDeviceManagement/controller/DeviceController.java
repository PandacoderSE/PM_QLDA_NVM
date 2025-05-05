package usol.group_4.ITDeviceManagement.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import usol.group_4.ITDeviceManagement.DTO.request.DeviceCreateRequest;
import usol.group_4.ITDeviceManagement.DTO.request.DeviceListRequest;
import usol.group_4.ITDeviceManagement.DTO.request.DeviceUpdateRequest;
import usol.group_4.ITDeviceManagement.DTO.request.DeviceUserRequest;
import usol.group_4.ITDeviceManagement.DTO.response.ApiResponse;
import usol.group_4.ITDeviceManagement.DTO.response.DeviceAssignmentResponse;
import usol.group_4.ITDeviceManagement.DTO.response.DeviceResponse;
import usol.group_4.ITDeviceManagement.DTO.response.PageResponse;
import usol.group_4.ITDeviceManagement.constant.AssignmentStatus;
import usol.group_4.ITDeviceManagement.entity.Device;
import usol.group_4.ITDeviceManagement.exception.CustomResponseException;
import usol.group_4.ITDeviceManagement.service.IDeviceService;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Date;
import java.util.Base64;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@RestController
@RequestMapping("/api/v1/devices")
@RequiredArgsConstructor
public class DeviceController {
    @Autowired
    private IDeviceService deviceService;

    @GetMapping("/{id}")
    public ApiResponse<?> getDevice(@PathVariable Long id){
        var device = deviceService.getDeviceResponseById(id);
        return ApiResponse.<DeviceResponse>builder()
                .success(true)
                .message("get device successfully")
                .data(device).build();
    }
    @GetMapping("/list")
    public ApiResponse<?> getDevice( @RequestParam(defaultValue = "1") int page,
                                     @RequestParam(defaultValue = "10") int pageSize,
                                     @RequestParam(required = false) String accountingCode,
                                     @RequestParam(required = false) String location,
                                     @RequestParam(required = false) String manufacturer,
                                     @RequestParam(required = false) String notes,
                                     @RequestParam(required = false)
                                     @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Date purchaseDate,
                                     @RequestParam(required = false) String purpose,
                                     @RequestParam(required = false) String serialNumber,
                                     @RequestParam(required = false) Long categoryId,
                                     @RequestParam(required = false)
                                     @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Date expirationDate,
                                     @RequestParam(required = false) Long ownerId){

        DeviceListRequest request = DeviceListRequest.builder()
                .accountingCode(accountingCode)
                .categoryId(categoryId)
                .page(page)
                .pageSize(pageSize)
                .ownerId(ownerId)
                .notes(notes)
                .purpose(purpose)
                .expirationDate(expirationDate)
                .manufacture(manufacturer)
                .serialNumber(serialNumber)
                .location(location)
                .purchaseDate(purchaseDate)
                .build();

        var devices = deviceService.getDevices(request);
        return ApiResponse.<PageResponse<DeviceResponse>>builder().success(true).message("list successfully").data(devices).build();

    }

    @PostMapping("/create")
    public ApiResponse<?> createDevice(@RequestBody DeviceCreateRequest request) {
        var device = deviceService.createDevice(request);
        return ApiResponse.<DeviceResponse>builder().success(true).message("create successfully").data(device).build();
    }

    @PutMapping("/update/{id}")
    public ApiResponse<?> updateDevice(@PathVariable long id, @RequestBody DeviceUpdateRequest request) {
        request.setId(id);
        var device = deviceService.updateDevice(request);
        return ApiResponse.<DeviceResponse>builder().success(true).message("update successfully").data(device).build();
    }

    @DeleteMapping("/delete")
    public ApiResponse<?> deleteDevice(@RequestBody List<Long> ids) {
        deviceService.deleteDevice(ids);
        return ApiResponse.builder().success(true).message("delete successfully").data(null).build();
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllDevices() {
        return ResponseEntity.ok(deviceService.getAllDevices());
    }

    @GetMapping("/device-counts")
    public ResponseEntity<?> getDeviceCounts() {
        List<Object[]> results = deviceService.countDeviceByCategory();
        return ResponseEntity.ok(results);
    }



    // Xử lý liên quan đến QRCode
    @GetMapping("/{id}/qrcode")
    public ResponseEntity<byte[]> getDeviceQRCode(@PathVariable Long id) throws Exception {
        Device device = deviceService.findDeviceById(id);
        if (device == null || device.getIdentifyCode() == null) {
            return ResponseEntity.notFound().build();
        }
        byte[] qrCodeImage = Base64.getDecoder().decode(device.getIdentifyCode());
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.IMAGE_PNG);
        headers.setContentLength(qrCodeImage.length);
        return new ResponseEntity<>(qrCodeImage, headers, HttpStatus.OK);
    }

    @PostMapping("/download")
    public ResponseEntity<byte[]> downloadQRCode(@RequestBody List<Long> deviceIds) throws IOException {
        ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
        ZipOutputStream zipOutputStream = new ZipOutputStream(byteArrayOutputStream);
        try {
            for (Long deviceId : deviceIds) {
                Device device = deviceService.findDeviceById(deviceId);
                if (device != null && device.getIdentifyCode() != null) {
                    byte[] qrCodeImage = Base64.getDecoder().decode(device.getIdentifyCode());
                    ZipEntry zipEntry = new ZipEntry(device.getSerialNumber() + ".png");
                    zipOutputStream.putNextEntry(zipEntry);
                    zipOutputStream.write(qrCodeImage);
                    zipOutputStream.closeEntry();
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            zipOutputStream.close();
            byteArrayOutputStream.close();
        }

        byte[] zipBytes = byteArrayOutputStream.toByteArray();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDispositionFormData("attachment", "qrcodes.zip");
        headers.setContentLength(zipBytes.length);

        return new ResponseEntity<>(zipBytes, headers, HttpStatus.OK);
    }


    @GetMapping("/by-status/{status}")
    public ApiResponse<?> getDeviceByStatus(@PathVariable String status) {
        return ApiResponse.builder().success(true).message("Get successfully").data(deviceService.findDeviceByStatus(status)).build();
    }

    @GetMapping("/search-device")
    public ResponseEntity<?> getDeviceCountsByDepartment(@RequestParam(required = false) String serialNumber,
                                                         @RequestParam(required = false) Date fromDate,
                                                         @RequestParam(required = false) Date toDate,
                                                         @RequestParam(required = false) Long categoryId,
                                                         @RequestParam(required = false) String ownerId,
                                                         @RequestParam(required = false) String status) {
        List<Object[]> results = deviceService.searchDeviceByCustomField(serialNumber, fromDate, toDate, categoryId, ownerId, status);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/get-device/{serialNumber}")
    public ApiResponse<?> getDeviceBySerialNumber(@PathVariable String serialNumber) {
        return ApiResponse.builder().success(true).message("Get successfully").data(deviceService.getDeviceBySerialNum(serialNumber)).build();
    }
    // hàm bàn giao
    @PostMapping("/set-device")
    public ApiResponse<?> setOwnerIdForDevice(@RequestBody DeviceUserRequest deviceUserRequest) {
        return ApiResponse.builder().success(true).message("Get successfully").data(deviceService.setDeviceForOwner(deviceUserRequest)).build();
    }

    @GetMapping("/by-notes")
    public ApiResponse<?> getDeviceByNotes() {
        return ApiResponse.builder().success(true).message("Get successfully").data(deviceService.getDeviceQuantityByStatus()).build();
    }

    @PostMapping("/transfer-device")
    public ApiResponse<?> transferUsedDevice(@RequestBody DeviceUserRequest deviceUserRequest) {
        return ApiResponse.builder().success(true).message("Get successfully").data(deviceService.transferUsedDevice(deviceUserRequest)).build();
    }

    @PostMapping("/transfer-empty-status/{serialNumber}")
    public ApiResponse<?> transferUsedDevice(@PathVariable String serialNumber) {
        return ApiResponse.builder().success(true).message("Get successfully").data(deviceService.transferEmptyStatusDevice(serialNumber)).build();
    }
    // ng dùng click approve thì mới là assigned
    @PostMapping("/approve-assignment")
    public ApiResponse<?> approveDeviceAssignment(
            @RequestBody List<Long> deviceIds) {
        List<DeviceResponse> response = deviceService.approveDeviceAssignment(deviceIds);
        return ApiResponse.builder().success(true).message("Get successfully").data(response).build();
    }
    // Lấy tất cả hoặc tìm kiếm vật tư bàn giao
    @GetMapping("/assignments")
    public ApiResponse<?> getUserAssignments(
            @RequestParam(required = false) AssignmentStatus status,
            @RequestParam(required = false) String serialNumber) {
        List<DeviceAssignmentResponse> assignments = deviceService.getAssignmentsByUserId(status, serialNumber);
        return ApiResponse.builder()
                .success(true)
                .message("Get assignments successfully")
                .data(assignments)
                .build();
    }
    // API mới: Từ chối bàn giao (xóa bản ghi)
    @PostMapping("/assignments/reject")
    public ApiResponse<?> rejectDeviceAssignment(@RequestParam Long assignmentId) {
        DeviceAssignmentResponse response = deviceService.rejectDeviceAssignment(assignmentId);
        return ApiResponse.builder()
                .success(true)
                .message("Assignment rejected and deleted successfully")
                .data(response)
                .build();
    }

    // API mới: Trả lại vật tư (set trạng thái RETURNED)
    @PostMapping("/assignments/return")
    public ApiResponse<?> returnDeviceAssignment(@RequestParam Long assignmentId) {
        DeviceAssignmentResponse response = deviceService.returnDeviceAssignment(assignmentId);
        return ApiResponse.builder()
                .success(true)
                .message("Assignment returned successfully")
                .data(response)
                .build();
    }
    @GetMapping("/{assignmentId}/download-pdf")
    public ResponseEntity<?> downloadHandoverPdf(
            @PathVariable Long assignmentId){ // Token để xác thực user
        try {

            FileSystemResource fileResource = deviceService.downloadHandoverPdf(assignmentId);
            return ResponseEntity.ok()
                    .header("Content-Disposition", "attachment; filename=" + fileResource.getFilename())
                    .body(fileResource);
        } catch (Exception e) {
            return ResponseEntity.status(e instanceof CustomResponseException
                            ? ((CustomResponseException) e).getStatus()
                            : HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi tải file PDF: " + e.getMessage());
        }
    }
}
