package com.example.auto.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RequestEvent {
    private Long requestId;
    private Long workflowId;
    private Long initiatorId;
    private String status;
    private int currentLevel;
    private String type; // APPROVED, REJECTED, MOVED
    private LocalDateTime at;
}

