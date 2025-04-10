package usol.group_4.ITDeviceManagement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import usol.group_4.ITDeviceManagement.entity.InvalidatedToken;

public interface TokenRepository extends JpaRepository<InvalidatedToken, String> {
}
