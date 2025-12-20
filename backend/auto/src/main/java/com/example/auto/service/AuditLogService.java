package com.example.auto.service;

import com.example.auto.model.AuditLog;
import com.example.auto.repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AuditLogService {

    @Autowired
    private AuditLogRepository repo;

    public void log(
            Long requestId,
            Long workflowId,
            int levelNo,
            String role,
            Long approverId,
            String action,
            String prevStatus,
            String newStatus,
            String remarks
    ) {
        AuditLog log = new AuditLog();
        log.setRequestId(requestId);
        log.setWorkflowId(workflowId);
        log.setLevelNo(levelNo);
        log.setRole(role);
        log.setApproverId(approverId);
        log.setAction(action);
        log.setPreviousStatus(prevStatus);
        log.setNewStatus(newStatus);
        log.setRemarks(remarks);
        log.setActionAt(LocalDateTime.now());

        repo.save(log);
    }
}
