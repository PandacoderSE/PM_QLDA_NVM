package usol.group_4.ITDeviceManagement.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import usol.group_4.ITDeviceManagement.entity.Owner;
import usol.group_4.ITDeviceManagement.repository.OwnerRepository;
import usol.group_4.ITDeviceManagement.service.IOwnerService;

import java.util.List;
import java.util.Optional;

@Service
public class OwnerServiceImpl implements IOwnerService {
    @Autowired
    private OwnerRepository ownerRepository;
    @Override
    public List<Object[]> getOwnerByID(String id) {
        Optional<Owner> owner = ownerRepository.findById(id);
        if(owner.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Mã nhân viên chưa tồn tại !");
        }
        return ownerRepository.getOwnerByID(id);
    }
}
