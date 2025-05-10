package usol.group_4.ITDeviceManagement.service.impl;

import com.itextpdf.io.font.PdfEncodings;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import usol.group_4.ITDeviceManagement.entity.Device;
import usol.group_4.ITDeviceManagement.entity.DeviceAssignment;
import usol.group_4.ITDeviceManagement.entity.User;
import usol.group_4.ITDeviceManagement.exception.ErrorCode;
import usol.group_4.ITDeviceManagement.repository.UserRepository;

import java.io.File;
import java.util.List;
import java.util.Optional;

@Service
public class PdfService {
    @Autowired
    private UserRepository userRepository ;
    private PdfFont getFont() throws Exception {
        String fontPath = "src/main/resources/fonts/Arial.ttf";
        return PdfFontFactory.createFont(fontPath, PdfEncodings.IDENTITY_H, PdfFontFactory.EmbeddingStrategy.PREFER_EMBEDDED);
    }

    public String generateHandoverPdf(DeviceAssignment assignment, List<Device> devices,String receiverName, String SignName, String returnConfirm) throws Exception {
        String fileName = "handover_" + assignment.getId() + ".pdf";
        String filePath = "uploads/pdf/" + fileName;

        // Create directory if it doesn't exist
        File directory = new File("uploads/pdf");
        if (!directory.exists()) {
            directory.mkdirs();
        }

        // Initialize PDF document
        PdfWriter writer = new PdfWriter(filePath);
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf);

        // Load font
        PdfFont font = getFont();

        // Header
        Paragraph header = new Paragraph("NMAXSOFTCOMPANY - IT DEVICE MANAGEMENT")
                .setFont(font)
                .setFontSize(18)
                .setBold()
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(10);
        document.add(header);

        // Title
        Paragraph title = new Paragraph("BIÊN BẢN BÀN GIAO VẬT TƯ")
                .setFont(font)
                .setFontSize(16)
                .setBold()
                .setTextAlignment(TextAlignment.CENTER)
                .setBorder(new SolidBorder(ColorConstants.BLACK, 1))
                .setPadding(5)
                .setBackgroundColor(ColorConstants.LIGHT_GRAY)
                .setMarginBottom(20);
        document.add(title);

        // Handover Information
        Table infoTable = new Table(UnitValue.createPercentArray(new float[]{1, 2}));
        infoTable.setWidth(UnitValue.createPercentValue(80));
        infoTable.setMarginBottom(20);
        infoTable.setHorizontalAlignment(com.itextpdf.layout.properties.HorizontalAlignment.CENTER);

        infoTable.addCell(new Cell().add(new Paragraph("Mã bàn giao:").setFont(font).setBold()).setBorder(Border.NO_BORDER));
        infoTable.addCell(new Cell().add(new Paragraph(String.valueOf(assignment.getId())).setFont(font)).setBorder(Border.NO_BORDER));
        String handoverDate = assignment.getHandoverDate() != null ? assignment.getHandoverDate().toString() : "N/A";
        infoTable.addCell(new Cell().add(new Paragraph("Ngày bàn giao:").setFont(font).setBold()).setBorder(Border.NO_BORDER));
        infoTable.addCell(new Cell().add(new Paragraph(handoverDate).setFont(font)).setBorder(Border.NO_BORDER));
        infoTable.addCell(new Cell().add(new Paragraph("Người nhận:").setFont(font).setBold()).setBorder(Border.NO_BORDER));
        infoTable.addCell(new Cell().add(new Paragraph(receiverName != null ? receiverName : "Chưa xác nhận").setFont(font)).setBorder(Border.NO_BORDER));

        document.add(infoTable);

        // Device List Table
        float[] columnWidths = {1, 3, 3, 3};
        Table deviceTable = new Table(UnitValue.createPercentArray(columnWidths));
        deviceTable.setWidth(UnitValue.createPercentValue(100));
        deviceTable.setMarginBottom(20);

        // Table Header
        String[] headers = {"STT", "Serial Number", "Tên vật tư", "Xác nhận trả đồ"};
        for (String headerText : headers) {
            deviceTable.addHeaderCell(new Cell()
                    .add(new Paragraph(headerText).setFont(font).setBold())
                    .setBackgroundColor(ColorConstants.GRAY)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setBorder(new SolidBorder(ColorConstants.BLACK, 1)));
        }

        // Table Data
        for (int i = 0; i < devices.size(); i++) {
            Device device = devices.get(i);
            deviceTable.addCell(new Cell()
                    .add(new Paragraph(String.valueOf(i + 1)).setFont(font))
                    .setTextAlignment(TextAlignment.CENTER)
                    .setBackgroundColor(i % 2 == 0 ? ColorConstants.WHITE : ColorConstants.LIGHT_GRAY)
                    .setBorder(new SolidBorder(ColorConstants.BLACK, 0.5f)));
            deviceTable.addCell(new Cell()
                    .add(new Paragraph(device.getSerialNumber() != null ? device.getSerialNumber() : "N/A").setFont(font))
                    .setBackgroundColor(i % 2 == 0 ? ColorConstants.WHITE : ColorConstants.LIGHT_GRAY)
                    .setBorder(new SolidBorder(ColorConstants.BLACK, 0.5f)));
            deviceTable.addCell(new Cell()
                    .add(new Paragraph(device.getManufacture() != null ? device.getManufacture() : "N/A").setFont(font))
                    .setBackgroundColor(i % 2 == 0 ? ColorConstants.WHITE : ColorConstants.LIGHT_GRAY)
                    .setBorder(new SolidBorder(ColorConstants.BLACK, 0.5f)));
            deviceTable.addCell(new Cell()
                    .add(new Paragraph(returnConfirm != null ? returnConfirm : "").setFont(font))
                    .setBackgroundColor(i % 2 == 0 ? ColorConstants.WHITE : ColorConstants.LIGHT_GRAY)
                    .setBorder(new SolidBorder(ColorConstants.BLACK, 0.5f)));
        }

        document.add(deviceTable);

        // Signature Section
        Table signatureTable = new Table(UnitValue.createPercentArray(new float[]{1, 1}));
        signatureTable.setWidth(UnitValue.createPercentValue(80));
        signatureTable.setHorizontalAlignment(com.itextpdf.layout.properties.HorizontalAlignment.CENTER);

        // Giver Signature
        Cell giverCell = new Cell()
                .add(new Paragraph("Người bàn giao").setFont(font).setBold().setTextAlignment(TextAlignment.CENTER))
                .add(new Paragraph("(Ký, ghi rõ họ tên)").setFont(font).setTextAlignment(TextAlignment.CENTER))
                .add(new Paragraph(assignment.getHandoverPerson()).setFont(font).setTextAlignment(TextAlignment.CENTER).setMarginTop(20))
                .setHeight(80)
                .setBorder(new SolidBorder(ColorConstants.BLACK, 1));
        signatureTable.addCell(giverCell);

        // Receiver Signature
        Cell receiverCell = new Cell()
                .add(new Paragraph("Người nhận").setFont(font).setBold().setTextAlignment(TextAlignment.CENTER))
                .add(new Paragraph("(Ký, ghi rõ họ tên)").setFont(font).setTextAlignment(TextAlignment.CENTER))
                .add(new Paragraph(SignName != null ? SignName : "Chưa xác nhận").setFont(font).setTextAlignment(TextAlignment.CENTER).setMarginTop(20))
                .setHeight(80)
                .setBorder(new SolidBorder(ColorConstants.BLACK, 1));
        signatureTable.addCell(receiverCell);

        document.add(signatureTable);

        // Close document
        document.close();
        pdf.close();
        writer.close();

        return filePath;
    }
    public User getMyInfo() {
        var context = SecurityContextHolder.getContext() ;
        String name = context.getAuthentication().getName() ;
        User user = Optional.ofNullable(userRepository.findByUsername(name)).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, ErrorCode.NON_EXISTING_ID_USER.getMessage()));
        return user ;
    }
    public String updateHandoverPdf(DeviceAssignment assignment, List<Device> devices, String receiverName, String SignName,String returnConfirm) throws Exception {
        File oldFile = new File(assignment.getPdfPath());
        if (oldFile.exists()) {
            if (!oldFile.delete()) {
                throw new RuntimeException("Failed to delete old PDF file: " + oldFile.getAbsolutePath());
            }
        }
        return generateHandoverPdf(assignment, devices, receiverName, SignName, returnConfirm);
    }
}