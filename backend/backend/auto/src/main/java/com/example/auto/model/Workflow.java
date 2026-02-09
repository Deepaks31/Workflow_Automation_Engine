package com.example.auto.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.security.PrivateKey;
import java.util.List;

@Entity
@Table(name = "workflows")
@Getter
@Setter
public class Workflow {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    @Lob
    @Column(columnDefinition = "TEXT")
    private String description;

    private String conditionField;     // amount
    private String conditionOperator;  // >
    private Double conditionValue;     // 10000

    private String status;
    private int escalationHours;
    private String createdBy;

    // Stores the visual designer graph (React Flow nodes & edges) as JSON
    @Lob
    @Column(columnDefinition = "TEXT")
    private String designerJson;

    @OneToMany(mappedBy = "workflow", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<ApprovalLevel> approvalLevels;
}

