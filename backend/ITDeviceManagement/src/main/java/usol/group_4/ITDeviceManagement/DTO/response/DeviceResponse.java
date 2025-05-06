package usol.group_4.ITDeviceManagement.DTO.response;

import lombok.Data;
import usol.group_4.ITDeviceManagement.entity.Category;

import java.time.LocalDateTime;
import java.util.Date;

@Data
public class DeviceResponse {
    private Long id;
    private String accountingCode;
    private String serialNumber;
    private String specification;
    private String manufacture;
    private String location;
    private Date purchaseDate;
    private String purpose;
    private String serviceTag;
    private Date expirationDate;
    private LocalDateTime updatedTime;
    private LocalDateTime createdTime;
    private String notes;
    private Category category;
    private String identifyCode;
    private String status;
    private Long assignmentId;
}
