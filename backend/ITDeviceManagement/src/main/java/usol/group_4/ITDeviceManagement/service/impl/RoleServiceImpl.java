package usol.group_4.ITDeviceManagement.service.impl;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.modelmapper.ModelMapper;
import usol.group_4.ITDeviceManagement.DTO.request.RoleRequest;
import usol.group_4.ITDeviceManagement.DTO.response.RoleResponse;
import usol.group_4.ITDeviceManagement.entity.Role;
import usol.group_4.ITDeviceManagement.repository.RoleRepository;
import usol.group_4.ITDeviceManagement.service.IRoleService;

import java.util.List;
import java.util.ArrayList;

@Service
@Slf4j
public class RoleServiceImpl implements IRoleService {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private ModelMapper modelMapper;


    @Override
//    public RoleResponse createRole(RoleRequest request) {
//        Role role = modelMapper.map(request, Role.class);
//        // Mối quan hệ n-n, nên phải thêm vô kia theo quan hệ
//        Set<Permission> list = new HashSet<>(permissionRepository.findAllByName(request.getPermissions()));
//        role.setPermissions(list);
//        role = roleRepository.save(role);
//        RoleResponse roleResponse = modelMapper.map(role, RoleResponse.class);
//        return roleResponse;
//    }
    public RoleResponse createRole(RoleRequest request) {
        Role role = modelMapper.map(request, Role.class);
        // Mối quan hệ n-n, nên phải thêm vô kia theo quan hệ
        role = roleRepository.save(role);
        RoleResponse roleResponse = modelMapper.map(role, RoleResponse.class);
        return roleResponse;
    }


    @Override
    public List<RoleResponse> getAlls() {
        List<Role> roleEntityList = roleRepository.findAll();
        List<RoleResponse> roleResList = new ArrayList<>();
        for (Role item : roleEntityList) {
            RoleResponse res = modelMapper.map(item, RoleResponse.class);
            roleResList.add(res);
        }
        return roleResList;
    }

    @Override
    public void deleteRole(Long id) {
        roleRepository.deleteById(id);
    }
}
