package com.example.auto.repository;

import com.example.auto.model.Request;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RequestRepository extends JpaRepository<Request, Long> {

    // ================= BASIC =================

    List<Request> findByInitiatorId(Long initiatorId);

    List<Request> findByWorkflowId(Long workflowId);

    List<Request> findByStatus(String status);

    List<Request> findByStatusAndCurrentLevel(String status, int currentLevel);

    List<Request> findByStatusStartingWith(String status);

    // ================= ROLE BASED =================
    @Query("""
        SELECT r
        FROM Request r
        WHERE r.status = 'PENDING'
          AND EXISTS (
              SELECT 1
              FROM ApprovalLevel al
              WHERE al.workflow.id = r.workflowId
                AND al.levelNo = r.currentLevel
                AND al.role = :role
          )
    """)
    List<Request> findPendingForRole(@Param("role") String role);

    // ================= ROLE + APPROVER =================
    // (Keeps service layer intact)
    @Query("""
        SELECT r
        FROM Request r
        WHERE r.status = 'PENDING'
          AND EXISTS (
              SELECT 1
              FROM ApprovalLevel al
              WHERE al.workflow.id = r.workflowId
                AND al.levelNo = r.currentLevel
                AND al.role = :role
          )
    """)
    List<Request> findPendingForApprover(
            @Param("approverId") Long approverId,
            @Param("role") String role
    );
}
