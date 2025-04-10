package usol.group_4.ITDeviceManagement.service.impl;

import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ansi.Ansi8BitColor;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import usol.group_4.ITDeviceManagement.DTO.request.*;
import usol.group_4.ITDeviceManagement.DTO.response.UserResponse;
import usol.group_4.ITDeviceManagement.entity.Role;
import usol.group_4.ITDeviceManagement.entity.User;
import usol.group_4.ITDeviceManagement.exception.ErrorCode;
import usol.group_4.ITDeviceManagement.repository.RoleRepository;
import usol.group_4.ITDeviceManagement.repository.UserRepository;
import usol.group_4.ITDeviceManagement.service.IUserService;

import javax.transaction.Transactional;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
@Slf4j
@Service
public class UserServiceImpl implements IUserService {

    @Autowired
    private UserRepository userRepository ;
    @Autowired
    private ModelMapper modelMapper ;
    @Autowired
    private RoleRepository roleRepository ;
    @Autowired
    private PasswordEncoder passwordEncoder ;
    @Override
    @Transactional
    public UserResponse createUser(UserRequest user) {
        if (userRepository.existsById(user.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, ErrorCode.EXISTING_USER.getMessage());
        }

        User userNew = modelMapper.map(user, User.class);
        userNew.setPassword(passwordEncoder.encode(user.getPassword()));
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, ErrorCode.EXISTING_USER.getMessage());}
        List<Role> roles = new ArrayList<>();
        if (user.getRoles() == null || user.getRoles().isEmpty()) {
            roles.add(roleRepository.findByName("MANAGE"));
        } else {
            for (String item : user.getRoles()) {
                Role role = roleRepository.findByName(item);
                if (role != null) {
                    roles.add(role);
                } else {
                    throw new ResponseStatusException(HttpStatus.NOT_FOUND, ErrorCode.NON_EXISTING_ROLE.getMessage());
                }
            }
        }
        userNew.setRoles(roles);

        return modelMapper.map(userRepository.save(userNew), UserResponse.class);
    }
    @Override
    public UserResponse getUser(String id) {
        Optional<User> optionalUser = userRepository.findById(id);
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            return modelMapper.map(user, UserResponse.class);
        } else {
            // Xử lý trường hợp không tìm thấy user
            throw new RuntimeException("User not found with id: " + id);
        }
    }

    @Override
    public User getCurrentUser() {
        var context = SecurityContextHolder.getContext() ;
        String name = context.getAuthentication().getName() ;
        log.info(name) ;
        return userRepository.findByUsername(name);
    }


    @Override
    public List<UserResponse> getAlls() {
        List<UserResponse> list = new ArrayList<>() ;
        List<User> listUserEntity = userRepository.findAll(Sort.by(Sort.Direction.DESC, "createdTime")) ;
        for(User item : listUserEntity){
            UserResponse userR = modelMapper.map(item,UserResponse.class) ;
            list.add(userR) ;
        }
        return list;
    }

    @Override
    public UserResponse getMyInfo() {
        var context = SecurityContextHolder.getContext() ;
        String name = context.getAuthentication().getName() ;
        log.info(name) ;
        User user = Optional.ofNullable(userRepository.findByUsername(name)).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, ErrorCode.NON_EXISTING_ID_USER.getMessage()));
        return modelMapper.map(user,UserResponse.class);
    }
    @Override
    public UserResponse updateProfile(UpdateProfileRequest updateRequest) {
        var context = SecurityContextHolder.getContext();
        String name = context.getAuthentication().getName();
        log.info(name);

        User user = Optional.ofNullable(userRepository.findByUsername(name))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, ErrorCode.NON_EXISTING_ID_USER.getMessage()));

        // Update user details
        user.setLastname(updateRequest.getLastname());
        user.setFirstname(updateRequest.getFirstname());
        user.setEmail(updateRequest.getEmail());
        user.setPhone(updateRequest.getPhone());

        userRepository.save(user);

        return modelMapper.map(user, UserResponse.class);
    }

    @Override
    public UserResponse updatePassword(UpdatePasswordRequest updatePasswordRequest) {
        var context = SecurityContextHolder.getContext();
        String name = context.getAuthentication().getName();
        log.info(name);

        User user = Optional.ofNullable(userRepository.findByUsername(name))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, ErrorCode.NON_EXISTING_ID_USER.getMessage()));

        // Xác minh mật khẩu cũ
        if (!passwordEncoder.matches(updatePasswordRequest.getOldPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The old secret is wrong");
        }

        // Cập nhật mật khẩu
        user.setPassword(passwordEncoder.encode(updatePasswordRequest.getNewPassword()));
        userRepository.save(user);

        return modelMapper.map(user, UserResponse.class);
    }

    @Override
    public void deletes(List<String> ids) {
        if(ids.isEmpty()) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Vui lòng chọn nài khoản để xóa !");
        for(String id : ids){
            User user = userRepository.findById(id).get() ;
            user.setStatus(0);
            userRepository.save(user) ;
        }
    }

    @Override
    public UserResponse updateUserPr(String id, UTR userRequest) {
        User user = userRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, ErrorCode.NON_EXISTING_ID_USER.getMessage()));
        user.setUsername(userRequest.getUsername());
        user.setFirstname(userRequest.getFirstname());
        user.setPhone(userRequest.getPhone());
        user.setLastname(userRequest.getLastname());
        user.setEmail(userRequest.getEmail());
        user.setStatus(userRequest.getStatus());
        List<Role> list = new ArrayList<>();
        for(RUP item : userRequest.getRoles()){
            Role role = roleRepository.findByName(item.getRole());
            list.add(role) ;
        }
        user.setRoles(list);
        return modelMapper.map(userRepository.save(user), UserResponse.class);
    }

    @Override
    public List<String> userRole() {
        var context = SecurityContextHolder.getContext() ;
        String name = context.getAuthentication().getName() ;
        log.info(name) ;
        User user = Optional.ofNullable(userRepository.findByUsername(name)).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, ErrorCode.NON_EXISTING_ID_USER.getMessage()));
        List<String> roleName = new ArrayList<>() ;
        for(Role it : user.getRoles()){
            roleName.add(it.getName()) ;
        }
        return roleName ;
    }


    @Override
    public void delete(String id) {
        if(userRepository.existsById(id)){
            throw new ResponseStatusException(HttpStatus.CONFLICT, ErrorCode.EXISTING_USER.getMessage()) ;
        }
        userRepository.deleteById(id);
    }
}
