package com.example.auto.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AuditLogResponse {
    private String workflowName;
    private Long workflowId;
    private Long requestId;
    private String initiatorName;
    private String currentStatus;
    private int approvalLevel;
    private String role;
    private Long assignedApprover;
    private LocalDateTime slaDeadline;
    private LocalDateTime actualCompletionTime;
    private String slaBreach; // "Yes" or "No"
    private LocalDateTime timestamp;
    private String requestData;
    private String remarks;
}
