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

            summary.add(map);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("data", summary);
        response.put("currentPage", page);
        response.put("totalPages", requestPage.getTotalPages());
        response.put("totalElements", requestPage.getTotalElements());

        return response;
    }

}