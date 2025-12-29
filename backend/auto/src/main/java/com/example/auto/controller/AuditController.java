package com.example.auto.controller;

import com.example.auto.model.AuditLog;
import com.example.auto.model.Request;
import com.example.auto.model.User;
import com.example.auto.repository.AuditLogRepository;
import com.example.auto.repository.RequestRepository;
import com.example.auto.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin
public class AuditController {

    @Autowired
    private AuditLogRepository auditRepo;

    @Autowired
    private RequestRepository requestRepo;

    @Autowired
    private UserRepository userRepo;

    // 🔹 Get all requests summary
    @GetMapping("/requests")
    public List<Request> getAllRequests() {
        return requestRepo.findAll();
    }

    // 🔹 Get audit logs for a specific request
    @GetMapping("/audit/request/{requestId}")
    public List<AuditLog> getLogsByRequest(@PathVariable Long requestId) {
        return auditRepo.findByRequestIdOrderByActionAtAsc(requestId);
    }


    // 🔹 Optionally filter by approver ID
    @GetMapping("/audit")
    public List<AuditLog> getAuditLogs(@RequestParam(required = false) Long approverId) {
        if (approverId != null) {
            return auditRepo.findByApproverId(approverId);
        }
        return auditRepo.findAll();
    }
    @GetMapping("/summary")
    public List<Map<String, Object>> getRequestsSummary() {

        List<Request> requests = requestRepo.findAll();
        List<Map<String, Object>> summary = new ArrayList<>();

        for (Request r : requests) {

            // 🔹 Fetch initiator name
            User initiator = userRepo.findById(r.getInitiatorId()).orElse(null);

            // 🔹 Fetch audit logs
            List<AuditLog> logs =
                    auditRepo.findByRequestIdOrderByActionAtDesc(r.getId());

            AuditLog lastLog = logs.isEmpty() ? null : logs.get(0);




            Map<String, Object> lastAction = null;

            if (lastLog != null) {
                User approver = null;
                if (lastLog.getApproverId() != null) {
                    approver = userRepo.findById(lastLog.getApproverId()).orElse(null);
                }


                lastAction = new HashMap<>();
                lastAction.put("approverId", lastLog.getApproverId());
                lastAction.put(
                        "approverName",
                        approver != null ? approver.getName() : "SYSTEM"
                );
                lastAction.put("action", lastLog.getAction());
                lastAction.put("actionAt", lastLog.getActionAt());
            }

            // 🔹 Response map
            Map<String, Object> map = new HashMap<>();
            map.put("request", r);
            map.put("initiatorName",
                    initiator != null ? initiator.getName() : "Unknown");
            map.put("totalApprovals", logs.size());
            map.put("lastAction", lastAction);

            summary.add(map);
        }

        return summary;
    }
}
