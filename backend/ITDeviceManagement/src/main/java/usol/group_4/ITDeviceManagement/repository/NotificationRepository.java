package usol.group_4.ITDeviceManagement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import usol.group_4.ITDeviceManagement.entity.Notification;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    @Query("SELECT n FROM Notification n WHERE n.createdTime BETWEEN :fromDate AND :toDate")
    List<Notification> findAllByDate(@Param("fromDate") LocalDateTime  fromDate, @Param("toDate") LocalDateTime  toDate);
}
