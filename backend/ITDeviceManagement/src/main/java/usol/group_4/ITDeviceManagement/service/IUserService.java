package usol.group_4.ITDeviceManagement.service;

import usol.group_4.ITDeviceManagement.DTO.request.*;
import usol.group_4.ITDeviceManagement.DTO.response.UserResponse;
import usol.group_4.ITDeviceManagement.entity.User;

import java.util.List;

public interface IUserService {
    UserResponse createUser(UserRequest user) ;
    UserResponse getUser(String un) ;
    User getCurrentUser();
    List<UserResponse> getAlls() ;
    UserResponse getMyInfo() ;
    void delete (String id) ;
    UserResponse updateProfile(UpdateProfileRequest updateRequest) ;
    UserResponse updatePassword(UpdatePasswordRequest updatePasswordRequest);
    void deletes (List<String> ids) ;
    UserResponse updateUserPr(String id , UTR userRequest) ;
    List<String> userRole () ;
}
