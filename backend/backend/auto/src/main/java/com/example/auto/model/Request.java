package com.example.auto.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Entity
@Table(name = "requests")
@Data
@Getter
@Setter
public class Request {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "workflow_id", nullable = false)
    private Long workflowId;

    @Column(name = "initiator_id", nullable = false)
    private Long initiatorId;

    private String status;

    private int currentLevel;

    private Long approvedBy;

    private LocalDateTime createdAt;
    private LocalDateTime lastActionAt;
    @Lob
    @Column(columnDefinition = "TEXT")
    private String remarks;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String requestData; // 🔥 JSON STRING (DYNAMIC)

    @ElementCollection
    @CollectionTable(name = "request_assignees", joinColumns = @JoinColumn(name = "request_id"))
    @MapKeyColumn(name = "level_no")
    @Column(name = "user_id")
    private Map<Integer, Long> assignees = new HashMap<>();

    // 🔥 AUTO SET TIMESTAMPS
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        lastActionAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        lastActionAt = LocalDateTime.now();
    }
}
