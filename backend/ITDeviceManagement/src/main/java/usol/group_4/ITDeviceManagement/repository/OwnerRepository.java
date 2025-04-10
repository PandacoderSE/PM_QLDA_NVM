package usol.group_4.ITDeviceManagement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import usol.group_4.ITDeviceManagement.entity.Owner;

import java.util.List;

@Repository
public interface OwnerRepository extends JpaRepository<Owner, String> {
	@Query("SELECT o.name, o.id, d.serialNumber, m.name FROM Owner o INNER JOIN Device d ON o.id = d.owner_id INNER JOIN Department m ON o.department.id = m.id WHERE o.id = :id")
    public List<Object[]> getOwnerByID(String id);
}
