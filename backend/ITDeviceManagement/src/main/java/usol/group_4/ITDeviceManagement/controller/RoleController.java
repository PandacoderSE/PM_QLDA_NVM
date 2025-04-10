package usol.group_4.ITDeviceManagement.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import usol.group_4.ITDeviceManagement.DTO.request.RoleRequest;
import usol.group_4.ITDeviceManagement.DTO.response.ApiResponse;
import usol.group_4.ITDeviceManagement.DTO.response.RoleResponse;
import usol.group_4.ITDeviceManagement.service.IRoleService;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/roles")
public class RoleController {


    @Autowired
    private IRoleService roleService;

    @PostMapping
    public ApiResponse<RoleResponse> create(@RequestBody RoleRequest request) {
        RoleResponse role = roleService.createRole(request);
        return ApiResponse.<RoleResponse>builder().data(role).build();
    }

    @GetMapping
    public ApiResponse<List<RoleResponse>> getAll() {
        return ApiResponse.<List<RoleResponse>>builder()
                .data(roleService.getAlls())
                .build();
    }

    @DeleteMapping("{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        roleService.deleteRole(id);
        return ApiResponse.<Void>builder().build();
    }
}
