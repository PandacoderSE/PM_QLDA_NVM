package usol.group_4.ITDeviceManagement.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import org.springframework.web.server.ResponseStatusException;
import usol.group_4.ITDeviceManagement.DTO.request.RequestDTO;
import usol.group_4.ITDeviceManagement.DTO.response.RequestResponse;
import usol.group_4.ITDeviceManagement.DTO.response.UserResponse;
import usol.group_4.ITDeviceManagement.constant.RequestStatus;
import usol.group_4.ITDeviceManagement.entity.Request;
import usol.group_4.ITDeviceManagement.entity.User;
import usol.group_4.ITDeviceManagement.exception.CustomResponseException;
import usol.group_4.ITDeviceManagement.exception.ErrorCode;
import usol.group_4.ITDeviceManagement.repository.RequestRepository;
import usol.group_4.ITDeviceManagement.repository.UserRepository;
import usol.group_4.ITDeviceManagement.service.IRequestService;

import javax.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RequestServiceImpl implements IRequestService {
    @Autowired
    private  RequestRepository requestRepository;
    @Autowired
    private UserRepository userRepository ;
    @Override
    public List<RequestResponse> getRequestsByUserId(String userId) {
        return requestRepository.findByUserId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public RequestResponse createRequest(RequestDTO createRequestDTO) {
        // Kiểm tra các trường bắt buộc (đã được xử lý bởi @NotBlank, nhưng để chắc chắn)
        if (createRequestDTO.getContent() == null || createRequestDTO.getContent().trim().isEmpty()) {
            throw new CustomResponseException(HttpStatus.BAD_REQUEST, "Content cannot be empty");
        }
        if (createRequestDTO.getUserId() == null || createRequestDTO.getUserId().trim().isEmpty()) {
            throw new CustomResponseException(HttpStatus.BAD_REQUEST, "User ID cannot be empty");
        }

        Request request = new Request();
        request.setUser(getMyInfo());
        request.setToUserId(createRequestDTO.getToUserId());
        request.setContent(createRequestDTO.getContent());
        request.setRequestDate(LocalDateTime.now());
        request.setStatus(RequestStatus.PENDING);
        request.setCreatedTime(LocalDateTime.now());
        requestRepository.save(request);

        return mapToResponse(request);
    }

    @Override
    public RequestResponse getRequestById(Long requestId, String userId) {
        Request request = requestRepository.findById(requestId)
                .orElseThrow(() -> new CustomResponseException(HttpStatus.NOT_FOUND, "Request not found"));

        if (!request.getUser().getId().equals(userId)) {
            throw new CustomResponseException(HttpStatus.FORBIDDEN, "You can only view your own requests");
        }

        return mapToResponse(request);
    }

    @Override
    public List<RequestResponse> getAllRequests() {
        return requestRepository.findByToUserId(getMyInfo().getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public RequestResponse respondToRequest(Long requestId, String responseContent) {
        Request request = requestRepository.findById(requestId)
                .orElseThrow(() -> new CustomResponseException(HttpStatus.NOT_FOUND, "Request not found"));

        if (responseContent == null || responseContent.trim().isEmpty()) {
            throw new CustomResponseException(HttpStatus.BAD_REQUEST, "Response content cannot be empty");
        }

        request.setContent(request.getContent() + "\n[Response]: " + responseContent);
        request.setStatus(RequestStatus.RESPONDED);
        request.setUpdatedTime(LocalDateTime.now());
        requestRepository.save(request);

        return mapToResponse(request);
    }

    @Override
    @Transactional
    public RequestResponse approveRequest(Long requestId) {
        Request request = requestRepository.findById(requestId)
                .orElseThrow(() -> new CustomResponseException(HttpStatus.NOT_FOUND, "Request not found"));



        request.setStatus(RequestStatus.APPROVED);
        request.setApprovedBy(getMyInfo().getId());
        request.setApprovedDate(LocalDateTime.now());
        request.setUpdatedTime(LocalDateTime.now());
        requestRepository.save(request);

        return mapToResponse(request);
    }

    @Override
    @Transactional
    public void deleteRequest(Long requestId) {
        Request request = requestRepository.findById(requestId)
                .orElseThrow(() -> new CustomResponseException(HttpStatus.NOT_FOUND, "Request not found"));
        requestRepository.delete(request);
    }

    @Override
    public List<RequestResponse> searchRequests(String userId, String status) {
        return requestRepository.findByUserIdOrStatus(userId, status).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private RequestResponse mapToResponse(Request request) {
        return RequestResponse.builder()
                .id(request.getId())
                .content(request.getContent())
                .requestDate(request.getRequestDate())
                .status(request.getStatus().name())
                .userId(request.getUser().getId())
                .toUserId(request.getToUserId())
                .approvedBy(request.getApprovedBy())
                .approvedDate(request.getApprovedDate())
                .build();
    }
    public User getMyInfo() {
        var context = SecurityContextHolder.getContext() ;
        String name = context.getAuthentication().getName() ;
        User user = Optional.ofNullable(userRepository.findByUsername(name)).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, ErrorCode.NON_EXISTING_ID_USER.getMessage()));
        return  user ;
    }
}
