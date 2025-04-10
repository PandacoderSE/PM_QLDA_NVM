package usol.group_4.ITDeviceManagement.service;

import usol.group_4.ITDeviceManagement.DTO.response.ExcelResponse;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.util.List;

public interface IExcelService {
    void importFromExcel(InputStream is);
    ByteArrayInputStream loadSelectedDevices(List<Long> deviceIds);
}
