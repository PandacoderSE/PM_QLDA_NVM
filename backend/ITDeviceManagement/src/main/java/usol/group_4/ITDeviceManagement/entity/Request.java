package usol.group_4.ITDeviceManagement.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import usol.group_4.ITDeviceManagement.constant.RequestStatus;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Request extends Auditable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    @Column(name = "to_user_id")
    private String toUserId; // Người nhận request (dạng String, có thể null)
    @Column(columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    private RequestStatus status; // Enum: PENDING, APPROVED, REJECTED

    private LocalDateTime requestDate;
    private String approvedBy;

    private LocalDateTime approvedDate;
}