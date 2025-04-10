package usol.group_4.ITDeviceManagement.service;

public interface IQRService {
    byte[] generateQRCode(String text, int width, int height) throws Exception;
    String generateQRCodeBase64(byte[] qrCodeImage);
}
