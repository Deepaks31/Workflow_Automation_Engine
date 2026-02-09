package com.example.auto.repository;

import com.example.auto.model.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    List<AuditLog> findByRequestIdOrderByActionAtAsc(Long requestId);

    List<AuditLog> findByWorkflowId(Long workflowId);

    List<AuditLog> findByApproverId(Long approverId);

    List<AuditLog> findByRequestIdOrderByActionAtDesc(Long requestId);


}
