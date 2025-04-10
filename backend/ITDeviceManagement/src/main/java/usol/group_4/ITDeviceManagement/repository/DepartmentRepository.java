package usol.group_4.ITDeviceManagement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import usol.group_4.ITDeviceManagement.entity.Department;

public interface DepartmentRepository extends JpaRepository<Department, Long> {

}
