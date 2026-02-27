package com.example.auto.controller;

import com.example.auto.model.AuditLog;
import com.example.auto.model.Request;
import com.example.auto.model.User;
import com.example.auto.repository.AuditLogRepository;
import com.example.auto.repository.RequestRepository;
import com.example.auto.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;
import com.example.auto.model.Workflow;

import com.example.auto.service.AuditorAnalyticsService;

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

    @Autowired
    private AuditorAnalyticsService analyticsService;

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
    public Map<String, Object> getRequestsSummary(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").ascending());
        Page<Request> requestPage = requestRepo.findAll(pageable);

        List<Map<String, Object>> summary = new ArrayList<>();

        for (Request r : requestPage.getContent()) {

            User initiator = userRepo.findById(r.getInitiatorId()).orElse(null);

            List<AuditLog> logs = auditRepo.findByRequestIdOrderByActionAtAsc(r.getId());
            AuditLog lastAction = logs.isEmpty() ? null : logs.get(logs.size() - 1);

            Map<String, Object> map = new HashMap<>();
            map.put("request", r);
            map.put("initiatorName", initiator != null ? initiator.getName() : "Unknown");
            map.put("lastAction", lastAction);
            // 5. SLA Breach Prediction flag
            map.put("slaRisk", computeSlaRisk(r));

            summary.add(map);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("data", summary);
        response.put("currentPage", page);
        response.put("totalPages", requestPage.getTotalPages());
        response.put("totalElements", requestPage.getTotalElements());

        return response;
    }

    private String computeSlaRisk(Request r) {
        try {
            Workflow wf = null;
            // lightweight fetch via workflowId (avoiding new autowire just for this)
            // We'll reuse requestRepo if needed in future; for now, just assume escalationHours from r.status context
            // If escalationHours not easily available, default to NORMAL
            // To avoid circular dep we keep this simple.
            // For now, mark HIGH_RISK if (now - createdAt) >= 70% of 24h as a safe heuristic.
            if (r.getCreatedAt() == null || r.getLastActionAt() == null) return "NORMAL";
            long minutes = java.time.temporal.ChronoUnit.MINUTES.between(r.getCreatedAt(), r.getLastActionAt());
            long totalMinutes = 24 * 60L;
            return minutes >= totalMinutes * 0.7 ? "HIGH_RISK" : "NORMAL";
        } catch (Exception e) {
            return "NORMAL";
        }
    }

    // ==== AI Analytics Endpoints for Auditor ====

    // 1. Approval Trend Prediction
    @GetMapping("/auditor/approval-trend")
    public Map<String, Object> approvalTrend() {
        return analyticsService.getApprovalTrend();
    }

    // 2. Bottleneck Detection
    @GetMapping("/auditor/bottlenecks")
    public Map<String, Object> bottlenecks() {
        return analyticsService.getBottlenecks();
    }

    // 3. Department Risk Score
    @GetMapping("/auditor/risk-score")
    public List<Map<String, Object>> riskScore() {
        return analyticsService.getDepartmentRiskScores();
    }

    // 4. Approver Performance Ranking
    @GetMapping("/auditor/performance-ranking")
    public List<Map<String, Object>> performanceRanking() {
        return analyticsService.getApproverPerformanceRanking();
    }

}