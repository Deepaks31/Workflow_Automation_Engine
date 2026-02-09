package com.example.auto.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "approval_levels")
@Getter
@Setter
public class ApprovalLevel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int levelNo;
    private String role;
    private int escalationHours;
    @ManyToOne
    @JoinColumn(name = "workflow_id")
    @JsonBackReference
    private Workflow workflow;

}
