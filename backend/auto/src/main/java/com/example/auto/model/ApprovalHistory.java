package com.example.auto.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "approval_history")
@Data
public class ApprovalHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long requestId;
    private int levelNo;
    private String role;
    private Long approverId;
    private String action; // APPROVED / REJECTED
    private LocalDateTime actionAt;
}
