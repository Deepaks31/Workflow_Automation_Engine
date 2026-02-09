package com.example.auto.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "escalation_history")
@Data
public class EscalationHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long requestId;
    private int fromLevel;
    private int toLevel;
    private String action; // ESCALATED / AUTO_REJECTED
    private LocalDateTime actionAt;
    private String reason;
}

