package usol.group_4.ITDeviceManagement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import usol.group_4.ITDeviceManagement.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, String> {

    User findByUsername(String name) ;
    boolean existsByUsername(String username) ;
}
