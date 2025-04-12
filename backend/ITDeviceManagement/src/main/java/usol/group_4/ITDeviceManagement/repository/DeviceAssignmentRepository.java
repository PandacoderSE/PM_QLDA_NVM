package usol.group_4.ITDeviceManagement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import usol.group_4.ITDeviceManagement.constant.AssignmentStatus;
import usol.group_4.ITDeviceManagement.entity.Department;
import usol.group_4.ITDeviceManagement.entity.DeviceAssignment;

import java.util.List;
import java.util.Optional;

public interface DeviceAssignmentRepository extends JpaRepository<DeviceAssignment, Long> {
    List<DeviceAssignment> findByDeviceIdOrderByHandoverDateDesc(Long deviceId);
    Optional<DeviceAssignment> findTopByDeviceIdOrderByHandoverDateDesc(Long deviceId);
    List<DeviceAssignment> findByToUserIdAndStatus(String toUserId, AssignmentStatus status);
    @Query("SELECT da.device.serialNumber FROM DeviceAssignment da WHERE da.toUser.id = :toUserId AND da.status = :status")
    List<String> findDeviceSerialNumbersByToUserIdAndStatus(String toUserId, AssignmentStatus status);

    //Tìm bản ghi mới nhất theo deviceId, toUserId, và status
    Optional<DeviceAssignment> findTopByDeviceIdAndToUserIdAndStatusOrderByHandoverDateDesc(Long deviceId, String toUserId, AssignmentStatus status);
}
