package usol.group_4.ITDeviceManagement.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import usol.group_4.ITDeviceManagement.DTO.request.*;
import usol.group_4.ITDeviceManagement.DTO.response.ApiResponse;
import usol.group_4.ITDeviceManagement.DTO.response.UserResponse;
import usol.group_4.ITDeviceManagement.service.IUserService;

import javax.validation.Valid;
import java.util.List;


@RestController
@RequestMapping("/api/v1/user")
public class UserController {

    @Autowired
    private IUserService userService;

    @GetMapping("/getAll")
    public ApiResponse<?> getUsers() {
        var users = userService.getAlls();
        return ApiResponse.<List<UserResponse>>builder().success(true).message("get user successfully").data(users).build();
    }

    @PostMapping("/addUser")
    public ApiResponse<?> addUser(@Valid @RequestBody UserRequest userRequest) {
        var user = userService.createUser(userRequest);
        return ApiResponse.<UserResponse>builder().success(true).message("add user successfully").data(user).build();
    }
    @PutMapping("/updateUser/{id}")
    public ApiResponse<?> updateUser(@PathVariable String id ,@Valid @RequestBody UTR userRequest) {
        var user = userService.updateUserPr(id , userRequest);
        return ApiResponse.<UserResponse>builder().success(true).message("update user successfully").data(user).build();
    }

    @GetMapping("getUser/{id}")
    public ApiResponse<?> getUser(@PathVariable String id) {
        var user = userService.getUser(id);
        return ApiResponse.<UserResponse>builder().success(true).message("get user successfully").data(user).build();
    }
    @GetMapping("getRoleByUser")
    public ApiResponse<?>  getUserRole() {
        List<String> roleName = userService.userRole() ;
        return ApiResponse.<List<String>>builder().success(true).message("get user successfully").data(roleName).build();
    }
    @DeleteMapping("deleteUser/{id}")
    public ApiResponse<?> deleteUser(@PathVariable String id) {
        userService.delete(id);
        return ApiResponse.<Void>builder().success(true).message("delete user successfully").build();
    }
    @DeleteMapping("deleteUsers/{ids}")
    public ApiResponse<?>  deleteUsers(@PathVariable List<String> ids) {
        userService.deletes(ids);
        return ApiResponse.<Void>builder().success(true).message("delete user successfully").build();
    }
    @GetMapping("/myInfo")
    public ApiResponse<UserResponse> getInfo() {
        return ApiResponse.<UserResponse>builder()
                .message("getInfo")
                .success(true)
                .data(userService.getMyInfo())
                .build();
    }

    @PutMapping("/updateProfile")
    public ApiResponse<UserResponse> updateProfile(@RequestBody UpdateProfileRequest updateProfileRequest) {
        return ApiResponse.<UserResponse>builder()
                .message("getInfo")
                .success(true)
                .data(userService.updateProfile(updateProfileRequest))
                .build();
    }

    @PutMapping("/updatePassword")
    public ApiResponse<UserResponse> updatePassword(@RequestBody UpdatePasswordRequest updatePasswordRequest) {
        return ApiResponse.<UserResponse>builder()
                .message("Update Password Successfully")
                .success(true)
                .data(userService.updatePassword(updatePasswordRequest))
                .build();
    }

}
