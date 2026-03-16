package com.example.auto.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String title;

    @Column(length = 1000)
    private String message;

    private String type; // MEETING, MOM, WORKFLOW

    private Long referenceId; // e.g. Meeting ID or Workflow ID

    private String status = "UNREAD"; // READ or UNREAD

    private LocalDateTime createdAt = LocalDateTime.now();
}
