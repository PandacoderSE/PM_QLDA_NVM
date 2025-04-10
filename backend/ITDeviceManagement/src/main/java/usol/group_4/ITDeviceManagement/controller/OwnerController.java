package usol.group_4.ITDeviceManagement.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import usol.group_4.ITDeviceManagement.DTO.response.ApiResponse;
import usol.group_4.ITDeviceManagement.service.impl.OwnerServiceImpl;

import java.util.List;

@RestController
@RequestMapping("/api/v1/owners/")
public class OwnerController {
    @Autowired
    private OwnerServiceImpl ownerService;
    @GetMapping("/{id}")
    public ApiResponse<?> getUserByID (@PathVariable String id){
        List<Object[]> owners = ownerService.getOwnerByID(id);
        return  ApiResponse.builder().success(true).message("Get user successfully !").data(owners).build();
    }
}
