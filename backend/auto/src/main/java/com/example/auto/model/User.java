package com.example.auto.model;

import com.example.auto.enums.UserStatus;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "users")
@Data
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true)
    private String email;

    private String password;

    private String role;   // ADMIN, INITIATOR, APPROVER, etc.

    @Enumerated(EnumType.STRING)
    private UserStatus status; // PENDING, ACTIVE
}
