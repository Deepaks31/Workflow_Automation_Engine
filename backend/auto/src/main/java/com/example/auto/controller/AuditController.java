package com.example.auto.controller;

import com.example.auto.model.AuditLog;
import com.example.auto.model.Request;
import com.example.auto.repository.AuditLogRepository;
import com.example.auto.repository.RequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin
public class AuditController {

    @Autowired
    private AuditLogRepository auditRepo;

    @Autowired
    private RequestRepository requestRepo;

    // 🔹 Get all requests summary
    @GetMapping("/requests")
    public List<Request> getAllRequests() {
        return requestRepo.findAll();
    }

    // 🔹 Get audit logs for a specific request
    @GetMapping("/audit/request/{requestId}")
    public List<AuditLog> getLogsByRequest(@PathVariable Long requestId) {
        return auditRepo.findByRequestId(requestId);
    }

    // 🔹 Optionally filter by approver ID
    @GetMapping("/audit")
    public List<AuditLog> getAuditLogs(@RequestParam(required = false) Long approverId) {
        if (approverId != null) {
            return auditRepo.findByApproverId(approverId);
        }
        return auditRepo.findAll();
    }
}
