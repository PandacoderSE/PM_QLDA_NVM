package usol.group_4.ITDeviceManagement.service.impl;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import usol.group_4.ITDeviceManagement.DTO.response.CategoryResponse;
import usol.group_4.ITDeviceManagement.DTO.response.ExcelResponse;
import usol.group_4.ITDeviceManagement.constant.StatusDevice;
import usol.group_4.ITDeviceManagement.entity.Category;
import usol.group_4.ITDeviceManagement.entity.Department;
import usol.group_4.ITDeviceManagement.entity.Device;
import usol.group_4.ITDeviceManagement.entity.Owner;
import usol.group_4.ITDeviceManagement.exception.CustomResponseException;
import usol.group_4.ITDeviceManagement.repository.DepartmentRepository;
import usol.group_4.ITDeviceManagement.repository.DeviceRepository;
import usol.group_4.ITDeviceManagement.repository.OwnerRepository;
import usol.group_4.ITDeviceManagement.service.ICategoryService;
import usol.group_4.ITDeviceManagement.service.IDeviceService;
import usol.group_4.ITDeviceManagement.service.IExcelService;
import usol.group_4.ITDeviceManagement.service.IQRService;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class ExcelServiceImpl implements IExcelService {
    @Autowired
    private DeviceRepository deviceRepository;
    @Autowired
    private OwnerRepository ownerRepository;
    @Autowired
    private ICategoryService categoryService;
    @Autowired
    private IQRService qrService;
    @Autowired
    private ModelMapper modelMapper;
    @Autowired
    private DepartmentRepository departmentRepository;

    public static String[] HEADERs = {"STT", "Accounting Code", "Serial Number", "Specification", "OwnerID", "Owner name", "Department", "Manufacture", "Location", "Ngày mua thiết bị", "Dự án/ Mục đích sử dụng", "Deadline sử dụng", "Notes", "Update 10/2024", "Status"};
    private static final SimpleDateFormat DATE_FORMAT = new SimpleDateFormat("M/d/yyyy");
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("M/d/yyyy");

    public static Date stringToDate(String dateStr) {
        try {
            if (dateStr != "") return DATE_FORMAT.parse(dateStr);
        } catch (ParseException e) {
            throw new CustomResponseException(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi khi chuyển đổi String thành Date");
        }
        return null;
    }

    public static String dateToString(Date date) {
        try {
            if (date != null) return DATE_FORMAT.format(date);
        } catch (Exception e) {
            throw new CustomResponseException(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi khi chuyển đổi Date thành String");
        }
        return "";
    }

    public static String localDateTimeToString(LocalDateTime dateTime) {
        try {
            if (dateTime != null) return dateTime.format(DATE_TIME_FORMATTER);
        } catch (Exception e) {
            throw new CustomResponseException(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi khi chuyển Local Date Time sang String");
        }
        return "";
    }

    @Override
    public void importFromExcel(InputStream is) {
        List<ExcelResponse> excelResponses = excelToDevices(is);
        List<Device> devices = new ArrayList<>();

        for (ExcelResponse response : excelResponses) {
            Device device = modelMapper.map(response, Device.class);
            Category category = new Category();
            category.setId(response.getCategoryId());
            category.setName(response.getCategoryName());
            device.setCategory(category);
            device.setOwner_id(response.getOwnerId());
            devices.add(device);
        }
        deviceRepository.saveAll(devices);
    }

    @Override
    public ByteArrayInputStream loadSelectedDevices(List<Long> deviceIds) {
        try {
            List<ExcelResponse> listExcel = new ArrayList<>();
            for (Long id : deviceIds) {
                Device device = deviceRepository.findById(id)
                        .orElseThrow(() -> new CustomResponseException(HttpStatus.NOT_FOUND, "Thiết bị không tồn tại"));

                // Thêm đối tượng ExcelResponse vào danh sách
                listExcel.add(new ExcelResponse(
                        Optional.ofNullable(device.getAccountingCode()).orElse(""),
                        Optional.ofNullable(device.getSerialNumber()).orElse(""),
                        Optional.ofNullable(device.getSpecification()).orElse(""),
                        Optional.ofNullable(device.getManufacture()).orElse(""),
                        Optional.ofNullable(device.getLocation()).orElse(""),
                        device.getPurchaseDate(),
                        Optional.ofNullable(device.getPurpose()).orElse(""),
                        device.getExpirationDate(),
                        Optional.ofNullable(device.getNotes()).orElse(""),
                        device.getUpdatedTime(),
                        Optional.ofNullable(device.getCategory().getName()).orElse(""),
                        device.getCategory().getId(),
                        Optional.ofNullable(device.getOwner_id()).orElse(""),
                        "",
                        null,
                        Optional.ofNullable(device.getStatus()).orElse(""),
                        ""
                ));
                // Nếu ownerID không rỗng, tìm chủ sở hữu và cập nhật ownerName và departmentID
                if (!Optional.ofNullable(device.getOwner_id()).orElse("").isEmpty()) {
                    Owner owner = ownerRepository.findById(device.getOwner_id())
                            .orElseThrow(() -> new CustomResponseException(HttpStatus.NOT_FOUND, "Chủ sở hữu không tồn tại"));

                    // Lấy đối tượng ExcelResponse vừa thêm vào danh sách
                    ExcelResponse lastAdded = listExcel.get(listExcel.size() - 1);
                    lastAdded.setOwnerName(Optional.ofNullable(owner.getName()).orElse(""));
                    lastAdded.setDepartmentID(owner.getDepartment().getId());
                }
            }
            return devicesToExcel(listExcel);

        } catch (Exception e) {
            throw new CustomResponseException(HttpStatus.INTERNAL_SERVER_ERROR, "Quá trình lấy dữ liệu từ database bị lỗi");
        }
    }

    private static CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 12);
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBottomBorderColor(IndexedColors.BLACK.getIndex());
        style.setBorderLeft(BorderStyle.THIN);
        style.setLeftBorderColor(IndexedColors.BLACK.getIndex());
        style.setBorderRight(BorderStyle.THIN);
        style.setRightBorderColor(IndexedColors.BLACK.getIndex());
        style.setBorderTop(BorderStyle.THIN);
        style.setTopBorderColor(IndexedColors.BLACK.getIndex());
        return style;
    }

    private static CellStyle createDataCellStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setBorderBottom(BorderStyle.THIN);
        style.setBottomBorderColor(IndexedColors.BLACK.getIndex());
        style.setBorderLeft(BorderStyle.THIN);
        style.setLeftBorderColor(IndexedColors.BLACK.getIndex());
        style.setBorderRight(BorderStyle.THIN);
        style.setRightBorderColor(IndexedColors.BLACK.getIndex());
        style.setBorderTop(BorderStyle.THIN);
        style.setTopBorderColor(IndexedColors.BLACK.getIndex());
        return style;
    }

    public ByteArrayInputStream devicesToExcel(List<ExcelResponse> excelResponses) {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Map<String, List<ExcelResponse>> deviceByType = excelResponses.stream()
                    .collect(Collectors.groupingBy(ExcelResponse::getCategoryName));

            for (Map.Entry<String, List<ExcelResponse>> entry : deviceByType.entrySet()) {
                String deviceType = entry.getKey();
                List<ExcelResponse> excelResponseList = entry.getValue();

                Sheet sheet = workbook.createSheet(deviceType);

                // Header
                Row headerRow = sheet.createRow(0);
                CellStyle headerStyle = createHeaderStyle(workbook);
                for (int col = 0; col < HEADERs.length; col++) {
                    Cell cell = headerRow.createCell(col);
                    cell.setCellValue(HEADERs[col]);
                    cell.setCellStyle(headerStyle);
                }

                // Data
                CellStyle dataCellStyle = createDataCellStyle(workbook);
                int rowIdx = 1;
                for (ExcelResponse excelResponse : excelResponseList) {
                    Row row = sheet.createRow(rowIdx++);

                    Cell cell0 = row.createCell(0);
                    cell0.setCellValue(rowIdx - 1);
                    cell0.setCellStyle(dataCellStyle);

                    Cell cell1 = row.createCell(1);
                    cell1.setCellValue(excelResponse.getAccountingCode());
                    cell1.setCellStyle(dataCellStyle);

                    Cell cell2 = row.createCell(2);
                    cell2.setCellValue(excelResponse.getSerialNumber());
                    cell2.setCellStyle(dataCellStyle);

                    Cell cell3 = row.createCell(3);
                    cell3.setCellValue(excelResponse.getSpecification());
                    cell3.setCellStyle(dataCellStyle);

                    Cell cell4 = row.createCell(4);
                    cell4.setCellValue(excelResponse.getOwnerId());
                    cell4.setCellStyle(dataCellStyle);

                    Cell cell5 = row.createCell(5);
                    cell5.setCellValue(excelResponse.getOwnerName());
                    cell5.setCellStyle(dataCellStyle);

                    Cell cell6 = row.createCell(6);
                    String departmentName = "";

                    if (!excelResponse.getOwnerId().isEmpty()) {
                        Optional<Owner> owner = ownerRepository.findById(String.valueOf(excelResponse.getOwnerId()));
                        departmentName = owner.get().getDepartment().getName();
                    }
                    cell6.setCellValue(departmentName);
                    cell6.setCellStyle(dataCellStyle);

                    Cell cell7 = row.createCell(7);
                    cell7.setCellValue(excelResponse.getManufacture());
                    cell7.setCellStyle(dataCellStyle);

                    Cell cell8 = row.createCell(8);
                    cell8.setCellValue(excelResponse.getLocation());
                    cell8.setCellStyle(dataCellStyle);

                    Cell cell9 = row.createCell(9);
                    cell9.setCellValue(dateToString(excelResponse.getPurchaseDate()));
                    cell9.setCellStyle(dataCellStyle);

                    Cell cell10 = row.createCell(10);
                    cell10.setCellValue(excelResponse.getPurpose());
                    cell10.setCellStyle(dataCellStyle);

                    Cell cell11 = row.createCell(11);
                    cell11.setCellValue(dateToString(excelResponse.getExpirationDate()));
                    cell11.setCellStyle(dataCellStyle);

                    Cell cell12 = row.createCell(12);
                    cell12.setCellValue(excelResponse.getNotes());
                    cell12.setCellStyle(dataCellStyle);

                    Cell cell13 = row.createCell(13);
                    cell13.setCellValue(localDateTimeToString(excelResponse.getUpdatedTime()));
                    cell13.setCellStyle(dataCellStyle);

                    Cell cell14 = row.createCell(14);
                    cell14.setCellValue(excelResponse.getStatus());
                    cell14.setCellStyle(dataCellStyle);

                }
                // Auto resize columns
                for (int col = 0; col < HEADERs.length; col++) {
                    sheet.autoSizeColumn(col);
                }
            }
            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        } catch (IOException e) {
            throw new CustomResponseException(HttpStatus.BAD_REQUEST, "Lỗi trong việc xử lý dữ liệu xuất file excel");
        }
    }

    public List<ExcelResponse> excelToDevices(InputStream is) {
        try {
            Workbook workbook = new XSSFWorkbook(is);
            List<ExcelResponse> excelResponses = new ArrayList<>();
            List<CategoryResponse> categories = categoryService.getAllCategory();
            List<Department> departments = departmentRepository.findAll();
            List<Device> devices = deviceRepository.findAll();

            for (int i = 0; i < workbook.getNumberOfSheets(); i++) {
                Sheet sheet = workbook.getSheetAt(i);
                String deviceType = sheet.getSheetName(); // Lưu tên sheet vào deviceType
                Iterator<Row> rows = sheet.iterator();
                int rowNumber = 0;

                while (rows.hasNext()) {
                    Row currentRow = rows.next();
                    // Skip header
                    if (rowNumber == 0) {
                        rowNumber++;
                        continue;
                    }

                    Iterator<Cell> cellsInRow = currentRow.iterator();
                    ExcelResponse excelResponse = new ExcelResponse();

                    int cellIdx = 0;
                    while (cellsInRow.hasNext()) {
                        Cell currentCell = cellsInRow.next();
                        switch (cellIdx) {
                            case 0:
                                // Bỏ qua cột id
                                break;
                            case 1:
                                if (currentCell.getCellType() == CellType.STRING) {
                                    String accountingCode = currentCell.getStringCellValue();
                                    Optional<Device> device = devices.stream()
                                            .filter(d -> d.getAccountingCode().equals(accountingCode))
                                            .findFirst();
                                    if (device.isPresent()) {
                                        throw new CustomResponseException(HttpStatus.NOT_FOUND, "Đang bị trùng Accouting code: " + device.get().getAccountingCode() + " tại dòng " + currentRow.getRowNum() + " sheet " + deviceType);
                                    } else {
                                        excelResponse.setAccountingCode(currentCell.getStringCellValue());
                                    }
                                } else if (currentCell.getCellType() == CellType.NUMERIC) {
                                    String accountingCode = String.valueOf((long) currentCell.getNumericCellValue());
                                    Optional<Device> device = devices.stream()
                                            .filter(d -> d.getAccountingCode().equals(accountingCode))
                                            .findFirst();
                                    if (device.isPresent()) {
                                        throw new CustomResponseException(HttpStatus.NOT_FOUND, "Đang bị trùng Accouting code: " + device.get().getAccountingCode() + " tại dòng " + currentRow.getRowNum() + " sheet " + deviceType);
                                    } else {
                                        excelResponse.setAccountingCode(device.get().getAccountingCode());
                                    }
                                } else {
                                    throw new CustomResponseException(HttpStatus.NOT_FOUND, "Accounting code không được để trống tại dòng " + currentRow.getRowNum() + " sheet " + deviceType);
                                }
                                break;
                            case 2:
                                if (currentCell.getCellType() == CellType.STRING) {
                                    String serialNumber = currentCell.getStringCellValue();
                                    Optional<Device> device = devices.stream()
                                            .filter(d -> d.getSerialNumber().equals(serialNumber))
                                            .findFirst();
                                    if (device.isPresent()) {
                                        throw new CustomResponseException(HttpStatus.NOT_FOUND, "Đang bị trùng Serial number: " + device.get().getSerialNumber() + " tại dòng " + currentRow.getRowNum() + " sheet " + deviceType);
                                    } else {
                                        excelResponse.setSerialNumber(currentCell.getStringCellValue());
                                    }
                                } else if (currentCell.getCellType() == CellType.NUMERIC) {
                                    String serialNumber = String.valueOf((long) currentCell.getNumericCellValue());
                                    Optional<Device> device = devices.stream()
                                            .filter(d -> d.getSerialNumber().equals(serialNumber))
                                            .findFirst();
                                    if (device.isPresent()) {
                                        throw new CustomResponseException(HttpStatus.NOT_FOUND, "Đang bị trùng Serial number: " + device.get().getSerialNumber() + " tại dòng " + currentRow.getRowNum() + " sheet " + deviceType);
                                    } else {
                                        excelResponse.setSerialNumber(device.get().getSerialNumber());
                                    }
                                } else {
                                    throw new CustomResponseException(HttpStatus.NOT_FOUND, "Serial number không được để trống tại dòng " + currentRow.getRowNum() + " sheet " + deviceType);
                                }
                                break;
                            case 3:
                                if (currentCell.getCellType() == CellType.STRING) {
                                    excelResponse.setSpecification(currentCell.getStringCellValue());
                                } else if (currentCell.getCellType() == CellType.NUMERIC) {
                                    excelResponse.setSpecification(String.valueOf((long) currentCell.getNumericCellValue()));
                                } else {
                                    throw new CustomResponseException(HttpStatus.NOT_FOUND, "Specification không được để trống tại dòng " + currentRow.getRowNum() + " sheet " + deviceType);
                                }
                                break;
                            case 4:
                                if (currentCell.getCellType() == CellType.STRING) {
                                    excelResponse.setOwnerId(currentCell.getStringCellValue());
                                    if (currentCell.getStringCellValue() == null) {
                                        excelResponse.setStatus(StatusDevice.CHUA_SU_DUNG.name());
                                    } else if (currentCell.getStringCellValue().isEmpty()) {
                                        excelResponse.setStatus(StatusDevice.CHUA_SU_DUNG.name());
                                    } else {
                                        excelResponse.setStatus(StatusDevice.DA_SU_DUNG.name());
                                    }
                                } else if (currentCell.getCellType() == CellType.NUMERIC) {
                                    excelResponse.setOwnerId(String.valueOf(currentCell.getNumericCellValue()));
                                    String oid = String.valueOf(currentCell.getNumericCellValue());
                                    if (oid == null) {
                                        excelResponse.setStatus(StatusDevice.CHUA_SU_DUNG.name());

                                    } else if (oid.isEmpty()) {
                                        excelResponse.setStatus(StatusDevice.CHUA_SU_DUNG.name());
                                    } else {
                                        excelResponse.setStatus(StatusDevice.DA_SU_DUNG.name());
                                    }
                                } else {
                                    excelResponse.setOwnerId("");
                                    excelResponse.setStatus(StatusDevice.CHUA_SU_DUNG.name());
                                }
                                break;
                            case 5:
                                if (currentCell.getCellType() == CellType.STRING) {
                                    excelResponse.setOwnerName(currentCell.getStringCellValue());
                                } else if (currentCell.getCellType() == CellType.NUMERIC) {
                                    excelResponse.setOwnerName(String.valueOf((long) currentCell.getNumericCellValue()));
                                } else {
                                    excelResponse.setOwnerName("");
                                }
                                break;
                            case 6:
                                if (currentCell.getCellType() == CellType.STRING) {
                                    String nameDepartment = currentCell.getStringCellValue();
                                    Optional<Department> department = Optional.empty();
                                    if (nameDepartment != "") {
                                        department = departments.stream()
                                                .filter(d -> d.getName().equals(nameDepartment))
                                                .findFirst();
                                    }

                                    if (department.isPresent()) {
                                        excelResponse.setDepartmentID(department.get().getId());
                                    } else if (department.equals(Optional.empty())) {
                                        excelResponse.setDepartmentID(null);
                                    } else {
                                        throw new CustomResponseException(HttpStatus.NOT_FOUND, "Phòng ban bạn nhập không tồn tại tại dòng " + currentRow.getRowNum() + " sheet " + deviceType);
                                    }
                                } else if (currentCell.getCellType() == CellType.NUMERIC) {
                                    String nameDepartment = String.valueOf((long) currentCell.getNumericCellValue());
                                    Optional<Department> department = departments.stream()
                                            .filter(d -> d.getName().equals(nameDepartment))
                                            .findFirst();
                                    if (department.isPresent()) {
                                        excelResponse.setDepartmentID(department.get().getId());
                                    } else {
                                        throw new CustomResponseException(HttpStatus.NOT_FOUND, "Phòng ban bạn nhập không tồn tại tại dòng " + currentRow.getRowNum() + " sheet " + deviceType);
                                    }
                                } else {
                                    excelResponse.setDepartmentID(null);
                                }
                                break;
                            case 7:
                                if (currentCell.getCellType() == CellType.STRING) {
                                    excelResponse.setManufacture(currentCell.getStringCellValue());
                                } else if (currentCell.getCellType() == CellType.NUMERIC) {
                                    excelResponse.setManufacture(String.valueOf((long) currentCell.getNumericCellValue()));
                                } else {
                                    throw new CustomResponseException(HttpStatus.NOT_FOUND, "Manufacture không được để trống tại dòng" + currentRow.getRowNum() + " sheet " + deviceType);
                                }
                                break;
                            case 8:
                                if (currentCell.getCellType() == CellType.STRING) {
                                    excelResponse.setLocation(currentCell.getStringCellValue());
                                } else if (currentCell.getCellType() == CellType.NUMERIC) {
                                    excelResponse.setLocation(String.valueOf((long) currentCell.getNumericCellValue()));
                                } else {
                                    excelResponse.setLocation("");
                                }
                                break;
                            case 9:
                                if (currentCell.getCellType() == CellType.STRING) {
                                    if (currentCell.getStringCellValue() != null) {
                                        excelResponse.setPurchaseDate(stringToDate(currentCell.getStringCellValue()));
                                    }
                                } else if (currentCell.getCellType() == CellType.NUMERIC) {
                                    if (currentCell.getDateCellValue() != null) {
                                        excelResponse.setPurchaseDate(currentCell.getDateCellValue());
                                    }
                                } else {
                                    throw new CustomResponseException(HttpStatus.NOT_FOUND, "Ngày mua không đúng định dạng tại dòng " + currentRow.getRowNum() + " sheet " + deviceType);
                                }
                                break;
                            case 10:
                                if (currentCell.getCellType() == CellType.STRING) {
                                    excelResponse.setPurpose(currentCell.getStringCellValue());
                                } else if (currentCell.getCellType() == CellType.NUMERIC) {
                                    excelResponse.setPurpose(String.valueOf((long) currentCell.getNumericCellValue()));
                                } else {
                                    excelResponse.setPurpose("");
                                }
                                break;
                            case 11:
                                if (currentCell.getCellType() == CellType.STRING) {
                                    if (currentCell.getStringCellValue() != null) {
                                        excelResponse.setExpirationDate(stringToDate(currentCell.getStringCellValue()));
                                    }
                                } else if (currentCell.getCellType() == CellType.NUMERIC) {
                                    if (currentCell.getDateCellValue() != null) {
                                        excelResponse.setExpirationDate(currentCell.getDateCellValue());
                                    }
                                } else {
                                    throw new CustomResponseException(HttpStatus.NOT_FOUND, "Ngày hết hạn không đúng định dạng tại dòng " + currentRow.getRowNum() + " sheet " + deviceType);
                                }
                                break;
                            case 12:
                                if (currentCell.getCellType() == CellType.STRING) {
                                    excelResponse.setNotes(currentCell.getStringCellValue());
                                } else if (currentCell.getCellType() == CellType.NUMERIC) {
                                    excelResponse.setNotes(String.valueOf((long) currentCell.getNumericCellValue()));
                                } else {
                                    excelResponse.setNotes("");
                                }
                                break;
                            case 13:
                                try {
                                    excelResponse.setUpdatedTime(LocalDateTime.now());
                                } catch (Exception e) {
                                    throw new CustomResponseException(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi trong việc cập nhật thời gian hệ thống");
                                }

                                break;

                            default:
                                break;
                        }
                        cellIdx++;
                    }
                    Optional<CategoryResponse> category = categories.stream()
                            .filter(c -> c.getName().equals(deviceType))
                            .findFirst();

                    if (category.isPresent()) {
                        excelResponse.setCategoryId(category.get().getId());
                    } else {
                        throw new CustomResponseException(HttpStatus.NOT_FOUND, "Không có danh mục " + deviceType + " trong cơ sở dữ liệu.");
                    }
                    String qrCodeText = String.format(
                            "Accounting code: %s \n" + "Location: %s \n" + "Notes: %s \n" + "Specification: %s \n" + "Category: %s \n",
                            excelResponse.getAccountingCode(),
                            excelResponse.getLocation(),
                            excelResponse.getNotes(),
                            excelResponse.getSpecification(),
                            deviceType != null ? deviceType : ""
                    );
                    byte[] qrCodeImage = null;
                    try {
                        qrCodeImage = qrService.generateQRCode(qrCodeText, 300, 300);
                    } catch (Exception e) {
                        throw new CustomResponseException(HttpStatus.UNPROCESSABLE_ENTITY, "Việc tạo qr code tự động không thể diễn ra do thiếu dữ liệu");
                    }
                    String qrCodeBase64 = qrService.generateQRCodeBase64(qrCodeImage);
                    excelResponse.setIdentifyCode(qrCodeBase64);
                    if (excelResponse.getOwnerId() == null || excelResponse.getOwnerName().isEmpty()) {
                        excelResponse.setStatus(StatusDevice.CHUA_SU_DUNG.name());
                    } else {
                        excelResponse.setStatus(StatusDevice.DA_SU_DUNG.name());
                    }
                    excelResponses.add(excelResponse);
                }
            }
            workbook.close();
            return excelResponses;
        } catch (IOException e) {
            throw new CustomResponseException(HttpStatus.BAD_REQUEST, "Lỗi trong việc chuyển đổi dữ liệu excel");
        }
    }


}
