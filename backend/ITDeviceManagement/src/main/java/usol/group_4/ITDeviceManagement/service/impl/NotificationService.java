package usol.group_4.ITDeviceManagement.service.impl;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import usol.group_4.ITDeviceManagement.DTO.request.NotiRequest;
import usol.group_4.ITDeviceManagement.DTO.response.NotiResponse;
import usol.group_4.ITDeviceManagement.DTO.response.UserResponse;
import usol.group_4.ITDeviceManagement.entity.Notification;
import usol.group_4.ITDeviceManagement.entity.Owner;
import usol.group_4.ITDeviceManagement.entity.User;
import usol.group_4.ITDeviceManagement.exception.ErrorCode;
import usol.group_4.ITDeviceManagement.repository.NotificationRepository;
import usol.group_4.ITDeviceManagement.repository.OwnerRepository;
import usol.group_4.ITDeviceManagement.repository.UserRepository;
import usol.group_4.ITDeviceManagement.service.INotificationService;

import javax.mail.MessagingException;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@EnableAsync // Bật bất đồng bộ
public class NotificationService implements INotificationService {

    @Autowired
    private NotificationRepository notificationRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private EmailService emailService;
    @Autowired
    private OwnerRepository ownerRepository;
    @Autowired
    private ModelMapper modelMapper ;
    public void createAndSendNotification(String title, String content) throws MessagingException {

        // Tạo và lưu thông báo
        Notification notification = new Notification();
        notification.setTitle(title);
        notification.setContent(content);
        notification.setCreatedBy(getMyInfo());
        notificationRepository.save(notification);

        // Lấy danh sách email của tất cả owner
        List<Owner> owners = ownerRepository.findAll();
        List<String> emailList = owners.stream()
                .map(Owner::getEmail)
                .collect(Collectors.toList());

        // Gửi email theo batch (mỗi batch 50 email)
        int batchSize = 50;
        for (int i = 0; i < emailList.size(); i += batchSize) {
            List<String> batch = emailList.subList(i, Math.min(i + batchSize, emailList.size()));
            emailService.sendBatchEmail(
                    batch,
                    title,
                    content,
                    notification.getCreatedTime()
            );
        }
    }

    @Override
    public List<NotiResponse> getAll() {
        List<Notification> listNoti = notificationRepository.findAll() ;
        List<NotiResponse> listNotiResponse = new ArrayList<>() ;
        for(Notification x : listNoti){
            NotiResponse y = new NotiResponse() ;
            y.setId(x.getId()) ;
            y.setTitle(x.getTitle());
            y.setContent(x.getContent());
            y.setCreateby(x.getCreatedBy().getLastname() + " " + x.getCreatedBy().getFirstname());
            y.setCreatedTime(x.getCreatedTime());
            listNotiResponse.add(y) ;
        }
        return listNotiResponse;
    }

    @Override
    public List<NotiResponse> getAllbyDate(Date fromDate, Date toDate) {
        // Chuyển Date sang LocalDateTime
        LocalDateTime from = fromDate.toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime();
        LocalDateTime to = toDate.toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime();

        List<Notification> listNoti = notificationRepository.findAllByDate(from, to);
        List<NotiResponse> listNotiResponse = new ArrayList<>();

        for (Notification x : listNoti) {
            NotiResponse y = new NotiResponse();
            y.setId(x.getId());
            y.setTitle(x.getTitle());
            y.setContent(x.getContent());
            y.setCreateby( x.getCreatedBy().getLastname() + " " + x.getCreatedBy().getFirstname());
            y.setCreatedTime(x.getCreatedTime()); // Nếu NotiResponse dùng LocalDate
            listNotiResponse.add(y);
        }
        return listNotiResponse;
    }

    @Override
    public NotiResponse getNotiByID(Long id) {
        Optional<Notification> noti= Optional.ofNullable(notificationRepository.findById(id)).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, ErrorCode.NON_EXISTING_ID_CATEGORY.getMessage()));
        NotiResponse y = new NotiResponse() ;
        y.setId(noti.get().getId()); ;
        y.setTitle(noti.get().getTitle());
        y.setContent(noti.get().getContent());
        y.setCreateby( noti.get().getCreatedBy().getLastname() + " " + noti.get().getCreatedBy().getFirstname());
        y.setCreatedTime(noti.get().getCreatedTime());
        return y;
    }

    @Override
    public void deletes(List<Long> ids) {
        List<Notification> notifications = notificationRepository.findAllById(ids);

        if (notifications.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, ErrorCode.NON_EXISTING_ID_CATEGORY.getMessage());
        }

        notificationRepository.deleteAll(notifications);
    }

    public User getMyInfo() {
        var context = SecurityContextHolder.getContext() ;
        String name = context.getAuthentication().getName() ;
        User user = Optional.ofNullable(userRepository.findByUsername(name)).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, ErrorCode.NON_EXISTING_ID_USER.getMessage()));
        return user ;
    }
}