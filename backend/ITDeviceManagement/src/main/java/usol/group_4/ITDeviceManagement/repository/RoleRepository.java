package usol.group_4.ITDeviceManagement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import usol.group_4.ITDeviceManagement.entity.Role;

import java.util.List;

public interface RoleRepository extends JpaRepository<Role,Long> {
    Role findByName(String name) ;
    List<Role> findAllByName(String name) ;


}
