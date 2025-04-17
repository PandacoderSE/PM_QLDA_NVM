package usol.group_4.ITDeviceManagement.DTO.request;

import lombok.Data;

import javax.validation.constraints.NotBlank;

@Data
public class RequestDTO {
    @NotBlank(message = "User ID cannot be blank")
    private String userId;

    private String toUserId; // Có thể null

    @NotBlank(message = "Content cannot be blank")
    private String content;
}
