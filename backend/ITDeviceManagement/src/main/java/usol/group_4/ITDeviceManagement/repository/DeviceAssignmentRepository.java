package usol.group_4.ITDeviceManagement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import usol.group_4.ITDeviceManagement.constant.AssignmentStatus;
import usol.group_4.ITDeviceManagement.entity.Department;
import usol.group_4.ITDeviceManagement.entity.DeviceAssignment;

import java.util.List;
import java.util.Optional;

public interface DeviceAssignmentRepository extends JpaRepository<DeviceAssignment, Long> {
    Optional<DeviceAssignment> findById(Long id);
    List<DeviceAssignment> findByDeviceIdOrderByHandoverDateDesc(Long deviceId);
    Optional<DeviceAssignment> findTopByDeviceIdOrderByHandoverDateDesc(Long deviceId);
    List<DeviceAssignment> findByToUserIdAndStatus(String toUserId, AssignmentStatus status);
    @Query("SELECT da.device.serialNumber FROM DeviceAssignment da WHERE da.toUser.id = :toUserId AND da.status = :status")
    List<String> findDeviceSerialNumbersByToUserIdAndStatus(String toUserId, AssignmentStatus status);

    //Tìm bản ghi mới nhất theo deviceId, toUserId, và status
    Optional<DeviceAssignment> findTopByDeviceIdAndToUserIdAndStatusOrderByHandoverDateDesc(Long deviceId, String toUserId, AssignmentStatus status);

    @Query("SELECT da FROM DeviceAssignment da " +
            "JOIN da.device d " +
            "WHERE da.toUser.id = :userId " +
            "AND (:status IS NULL OR da.status = :status) " +
            "AND (:serialNumber IS NULL OR d.serialNumber LIKE %:serialNumber%)")
    List<DeviceAssignment> findAssignmentsByUserIdAndFilters(
            @Param("userId") String userId,
            @Param("status") AssignmentStatus status,
            @Param("serialNumber") String serialNumber);

}
