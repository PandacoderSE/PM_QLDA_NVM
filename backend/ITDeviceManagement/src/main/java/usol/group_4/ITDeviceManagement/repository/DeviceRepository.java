package usol.group_4.ITDeviceManagement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import usol.group_4.ITDeviceManagement.DTO.request.DeviceListRequest;
import usol.group_4.ITDeviceManagement.entity.Device;

import javax.transaction.Transactional;
import java.util.Date;
import java.util.List;

@Repository
public interface DeviceRepository extends JpaRepository<Device, Long> {

    @Query(value = "CALL list_device('LIST', :#{#params.page}, :#{#params.pageSize}, :#{#params.accountingCode}, " +
            ":#{#params.location}, :#{#params.manufacture}, :#{#params.notes}, " +
            ":#{#params.purchaseDate}, :#{#params.purpose}, :#{#params.serialNumber}," +
            ":#{#params.categoryId}, :#{#params.expirationDate})", nativeQuery = true)
    List<Device> getDevices(DeviceListRequest params);

    Device findBySerialNumber(String serialNumber);

    Device findByAccountingCode(String accountingCode);

    @Query(value = "CALL list_device('COUNT', :#{#params.page}, :#{#params.pageSize}, :#{#params.accountingCode}, " +
            ":#{#params.location}, :#{#params.manufacture}, :#{#params.notes}, " +
            ":#{#params.purchaseDate}, :#{#params.purpose}, :#{#params.serialNumber}," +
            ":#{#params.categoryId}, :#{#params.expirationDate})", nativeQuery = true)
    Long countTotalDevices(DeviceListRequest params);

    @Query("SELECT c.id, c.name, COUNT(d) " + "FROM Device d " + "INNER JOIN d.category c " + "GROUP BY c.id, c.name")
    List<Object[]> findDeviceQuantityByCategory();

    @Query("SELECT d.serialNumber, d.category.name, d.specification, d.purchaseDate, d.owner_id, d.status FROM Device d INNER JOIN Category c ON d.category.id = c.id WHERE d.status = :status")
    List<Object[]> findByStatus(String status);

    @Query("SELECT d FROM Device d WHERE d.owner_id = :owner_id")
    Device checkExistOwner(String owner_id);

    @Query("SELECT d.serialNumber, d.category.name, d.specification, d.purchaseDate, d.owner_id, d.status  FROM Device d WHERE (:serialNumber IS NULL OR d.serialNumber = :serialNumber) "
            + "AND (:fromDate IS NULL OR d.purchaseDate >= :fromDate) " + "AND (:toDate IS NULL OR d.purchaseDate <= :toDate) "
            + "AND (:categoryId IS NULL OR d.category.id = :categoryId) "
            + "AND (:ownerId IS NULL OR d.owner_id = :ownerId) "
            + "AND (:status IS NULL OR d.status = :status)"
    )
    List<Object[]> findByCriteria(@Param("serialNumber") String serialNumber,
                                  @Param("fromDate") Date fromDate,
                                  @Param("toDate") Date toDate,
                                  @Param("categoryId") Long categoryId,
                                  @Param("ownerId") String ownerId,
                                  @Param("status") String status
    );

    @Modifying
    @Transactional
    @Query("UPDATE Device d SET d.category = null WHERE d.category.id = :categoryId")
    void updateCategoryIdToNull(@Param("categoryId") Long categoryId);

    @Query("SELECT d.serialNumber, d.category.name, d.specification, d.purchaseDate, d.status, d.accountingCode, o.name, o.id, d.identifyCode FROM Device d LEFT JOIN Owner o ON d.owner_id = o.id WHERE d.serialNumber = :serialNumber")
    List<Object[]> getDeviceBySerialNum(String serialNumber);

    @Query("SELECT de.name, COUNT(d) " +
            "FROM Device d " +
            "INNER JOIN Owner o ON d.owner_id = o.id " +
            "LEFT JOIN Department de ON o.department.id = de.id " +
            "GROUP BY de.name")
    List<Object[]> findDeviceQuantityByDepartment();

    @Query("SELECT d.serialNumber, d.status FROM Device d WHERE d.status IN ('CHUA_SU_DUNG', 'DA_SU_DUNG')")
    List<Object[]> getDeviceQuantityByStatus();

}
