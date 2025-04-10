package usol.group_4.ITDeviceManagement.service;

import usol.group_4.ITDeviceManagement.DTO.request.RoleRequest;
import usol.group_4.ITDeviceManagement.DTO.response.RoleResponse;

import java.util.List;

public interface IRoleService {
    RoleResponse createRole (RoleRequest request) ;
    List<RoleResponse> getAlls() ;
    void deleteRole(Long id) ;
}
