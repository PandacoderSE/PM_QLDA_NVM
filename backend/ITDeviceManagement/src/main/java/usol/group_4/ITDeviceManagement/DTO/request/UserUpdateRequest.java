package usol.group_4.ITDeviceManagement.DTO.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.Email;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;
import java.util.List;
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserUpdateRequest {
    private String id;
    @Size(min = 8, message = "Username phải có ít nhất 8 ký tự")
    private String username;

    @Size(min = 6, message = "Password phải có ít nhất 6 ký tự")
    private String password;
    private String firstname;
    private String lastname;
    @Email(message = "Email không hợp lệ")
    private String email;
    @Pattern(regexp = "\\d+", message = "Số điện thoại chỉ được chứa các ký tự số")
    private int status;
    private List<String> roles;
}
