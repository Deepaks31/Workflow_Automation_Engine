package com.example.auto.repository;

import com.example.auto.model.Request;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
        WHERE (r.status LIKE 'PENDING%' OR r.status LIKE 'ESCALATED%')
          AND EXISTS (
              SELECT 1
              FROM ApprovalLevel al
              WHERE al.workflow.id = r.workflowId
                AND al.levelNo = r.currentLevel
                AND UPPER(al.role) = :role
          )
    """)
    List<Request> findPendingForRole(@Param("role") String role);

    // ================= ROLE + APPROVER =================
    // (Keeps service layer intact)
    @Query("""
        SELECT r
        FROM Request r
        WHERE (r.status LIKE 'PENDING%' OR r.status LIKE 'ESCALATED%')
          AND EXISTS (
              SELECT 1
              FROM ApprovalLevel al
              WHERE al.workflow.id = r.workflowId
                AND al.levelNo = r.currentLevel
                AND UPPER(al.role) = :role
          )
    """)
    List<Request> findPendingForApprover(
            @Param("approverId") Long approverId,
            @Param("role") String role
    );

    Page<Request> findAll(Pageable pageable);

    // Monthly approved counts since given date (MySQL)
    @Query(value = """
            SELECT DATE_FORMAT(created_at, '%Y-%m') AS ym, COUNT(*) 
            FROM requests 
            WHERE status = 'APPROVED' AND created_at >= :fromDate
            GROUP BY ym
            ORDER BY ym
            """, nativeQuery = true)
    List<Object[]> findApprovedCountsByMonthSince(@Param("fromDate") java.time.LocalDateTime fromDate);
}
