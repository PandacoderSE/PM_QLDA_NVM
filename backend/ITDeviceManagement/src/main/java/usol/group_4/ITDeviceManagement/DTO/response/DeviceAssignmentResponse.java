package usol.group_4.ITDeviceManagement.DTO.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import usol.group_4.ITDeviceManagement.constant.AssignmentStatus;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeviceAssignmentResponse {
    private Long id;
    private Long deviceId;
    private String serialNumber;
    private String manufacturer;
    private String userId;
    private int quantity;
    private LocalDateTime handoverDate;
    private AssignmentStatus status;
}