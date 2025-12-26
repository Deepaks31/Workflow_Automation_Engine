package com.example.auto.controller;

import com.example.auto.dto.ActionRequestDto;
import com.example.auto.dto.RequestDTO;
import com.example.auto.model.AuditLog;
import com.example.auto.model.Request;
import com.example.auto.model.User;
import com.example.auto.repository.AuditLogRepository;
import com.example.auto.repository.RequestRepository;
import com.example.auto.repository.UserRepository;
import com.example.auto.service.RequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/requests")
@CrossOrigin
public class RequestController {

    private final RequestService service;
    private final RequestRepository requestRepo;
    private final AuditLogRepository auditRepo;
    @Autowired
    private  UserRepository userRepo;

    public RequestController(RequestService service,
                             RequestRepository requestRepo,
                             AuditLogRepository auditRepo) {
        this.service = service;
        this.requestRepo = requestRepo;
        this.auditRepo = auditRepo;
    }

    @PostMapping
    public Request create(@RequestBody RequestDTO dto) {
        return service.createRequest(dto);
    }

    @GetMapping("/initiator/{id}")
    public List<Request> myRequests(@PathVariable Long id) {
        return service.findByInitiator(id);
    }

    @GetMapping("/pending")
    public List<Request> getPendingByLevel(@RequestParam int level) {
        return requestRepo.findByStatusAndCurrentLevel("PENDING", level);
    }

    @PutMapping("/{id}/approve")
    public Request approve(@PathVariable Long id,
                           @RequestBody Map<String, Long> body) {
        return service.approveRequest(id, body.get("approverId"));
    }

    @PutMapping("/{id}/reject")
    public Request reject(@PathVariable Long id,
                          @RequestBody ActionRequestDto dto) {
        return service.reject(id, dto);
    }


    // ✅ MANAGER
    @GetMapping("/pending/manager/{managerId}/view")
    public List<Map<String, Object>> managerView(@PathVariable Long managerId) {
        return service.getPendingForManagerWithNames(managerId);
    }

    // ✅ FINANCE
    @GetMapping("/pending/finance/{financeId}/view")
    public List<Map<String, Object>> financeView(@PathVariable Long financeId) {
        return service.getPendingForFinanceWithNames(financeId);
    }


    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.deleteRequest(id);
    }

    @GetMapping("/{id}")
    public Request getById(@PathVariable Long id) {
        return requestRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));
    }

    @GetMapping("/summary")
    public List<Map<String, Object>> getRequestsSummary() {

        List<Request> requests = requestRepo.findAll();
        List<Map<String, Object>> summary = new ArrayList<>();

        for (Request r : requests) {

            // 🔹 Fetch initiator name
            User initiator = userRepo.findById(r.getInitiatorId()).orElse(null);

            // 🔹 Fetch audit logs
            List<AuditLog> logs = auditRepo.findByRequestId(r.getId());

            AuditLog lastLog = logs.stream()
                    .max(Comparator.comparing(AuditLog::getActionAt))
                    .orElse(null);

            Map<String, Object> lastAction = null;

            if (lastLog != null) {
                User approver = userRepo.findById(lastLog.getApproverId()).orElse(null);

                lastAction = new HashMap<>();
                lastAction.put("approverId", lastLog.getApproverId());
                lastAction.put("approverName",
                        approver != null ? approver.getName() : "Unknown");
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
