package usol.group_4.ITDeviceManagement.service;

import usol.group_4.ITDeviceManagement.DTO.request.DeviceCreateRequest;
import usol.group_4.ITDeviceManagement.DTO.request.DeviceListRequest;
import usol.group_4.ITDeviceManagement.DTO.request.DeviceUpdateRequest;
import usol.group_4.ITDeviceManagement.DTO.request.DeviceUserRequest;
import usol.group_4.ITDeviceManagement.DTO.response.DeviceResponse;
import usol.group_4.ITDeviceManagement.DTO.response.PageResponse;
import usol.group_4.ITDeviceManagement.entity.Device;

import java.util.Date;
import java.util.List;

public interface IDeviceService {
    DeviceResponse getDeviceResponseById(Long id);

    PageResponse<DeviceResponse> getDevices(DeviceListRequest request);

    DeviceResponse createDevice(DeviceCreateRequest request);

    DeviceResponse updateDevice(DeviceUpdateRequest request);

    void deleteDevice(List<Long> ids);

    public List<DeviceResponse> getAllDevices();

    public List<Object[]> countDeviceByCategory();

    public List<Object[]> countDeviceByDepartment();

    Device findDeviceById(Long id);

    public List<Object[]> findDeviceByStatus(String status);

    public DeviceResponse setDeviceForOwner(DeviceUserRequest deviceUserRequest);

    public List<Object[]> searchDeviceByCustomField(String serialNumber, Date fromDate, Date toDate, Long categoryId, String ownerId, String status);

    public List<Object[]> getDeviceBySerialNum(String serialNumber);

    public List<Object[]> getDeviceQuantityByStatus();

    public DeviceResponse transferUsedDevice(DeviceUserRequest deviceUserRequest);

    public DeviceResponse transferEmptyStatusDevice(String serialNumber);
}
