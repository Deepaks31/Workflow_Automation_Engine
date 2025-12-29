package com.example.auto.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Data
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long requestId;
    private Long workflowId;
    private int levelNo;
    private String role;
    private Long approverId;

    private String action;          // APPROVED / REJECTED / ESCALATED
    @Column(columnDefinition = "TEXT")
    private String previousStatus;

    @Column(columnDefinition = "TEXT")
    private String newStatus;


    @Column(length = 1000)
    private String remarks;

    private LocalDateTime actionAt = LocalDateTime.now();
}
