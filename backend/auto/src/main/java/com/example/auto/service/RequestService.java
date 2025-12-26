package com.example.auto.service;

import com.example.auto.dto.ActionRequestDto;
import com.example.auto.dto.RequestDTO;
import com.example.auto.model.*;
import com.example.auto.repository.*;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service

@RequiredArgsConstructor
public class RequestService {

    private final WorkflowRepository workflowRepo;
    private final RequestRepository requestRepo;
    private final ApprovalHistoryRepository historyRepo;
    private final AuditLogService auditLogService;
    private final ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private AuditLogRepository auditRepo;

    // ================= CREATE REQUEST =================
    public Request createRequest(RequestDTO dto) {

        Workflow wf = workflowRepo.findById(dto.getWorkflowId())
                .orElseThrow(() -> new RuntimeException("Workflow not found"));

        Request req = new Request();
        req.setWorkflowId(wf.getId());
        req.setInitiatorId(dto.getInitiatorId());
        req.setCreatedAt(LocalDateTime.now());
        req.setLastActionAt(LocalDateTime.now());
        req.setStatus("PENDING");
        req.setCurrentLevel(1);

        try {
            req.setRequestData(objectMapper.writeValueAsString(dto.getData()));
        } catch (JsonProcessingException e) {
            throw new RuntimeException("JSON conversion failed", e);
        }

        return requestRepo.save(req);
    }

    public void deleteRequest(Long id) {
        requestRepo.deleteById(id);
    }

    // ================= FIND =================
    public List<Request> findByInitiator(Long id) {
        return requestRepo.findByInitiatorId(id);
    }

    public List<Request> getPendingRequests() {
        return requestRepo.findByStatus("PENDING");
    }

    // ================= APPROVE =================
    public Request approveRequest(Long requestId, Long approverId) {

        Request req = requestRepo.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        Workflow wf = workflowRepo.findById(req.getWorkflowId())
                .orElseThrow(() -> new RuntimeException("Workflow not found"));

        int currentLevel = req.getCurrentLevel();
        String oldStatus = req.getStatus();

        ApprovalLevel currentApproval = wf.getApprovalLevels().stream()
                .filter(l -> l.getLevelNo() == currentLevel)
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Invalid approval level"));

        // Save approval history
        ApprovalHistory history = new ApprovalHistory();
        history.setRequestId(req.getId());
        history.setLevelNo(currentLevel);
        history.setRole(currentApproval.getRole());
        history.setApproverId(approverId);
        history.setAction("APPROVED");
        history.setActionAt(LocalDateTime.now());
        historyRepo.save(history);

        // Move to next level or finalize
        boolean hasNextLevel = wf.getApprovalLevels().stream()
                .anyMatch(l -> l.getLevelNo() == currentLevel + 1);

        if (hasNextLevel) {
            req.setCurrentLevel(currentLevel + 1);
            req.setStatus("PENDING");
        } else {
            req.setStatus("APPROVED");
        }

        req.setLastActionAt(LocalDateTime.now());
        Request saved = requestRepo.save(req);

        auditLogService.log(
                saved.getId(),
                saved.getWorkflowId(),
                currentLevel,
                currentApproval.getRole(),
                approverId,
                "APPROVED",
                oldStatus,
                saved.getStatus(),
                "Approved by " + currentApproval.getRole()
        );

        return saved;
    }

    // ================= REJECT =================
    public Request reject(Long requestId, ActionRequestDto dto) {

        Request req = requestRepo.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        Workflow wf = workflowRepo.findById(req.getWorkflowId())
                .orElseThrow(() -> new RuntimeException("Workflow not found"));

        int level = req.getCurrentLevel();
        String oldStatus = req.getStatus();

        // ✅ EXACT PLACE FOR YOUR CODE
        req.setRemarks(dto.getRemarks());
        req.setStatus("REJECTED");
        req.setLastActionAt(LocalDateTime.now());

        ApprovalLevel levelInfo = wf.getApprovalLevels().stream()
                .filter(l -> l.getLevelNo() == level)
                .findFirst()
                .orElse(null);

        ApprovalHistory history = new ApprovalHistory();
        history.setRequestId(req.getId());
        history.setLevelNo(level);
        history.setRole(levelInfo != null ? levelInfo.getRole() : "UNKNOWN");
        history.setApproverId(dto.getApproverId());
        history.setAction("REJECTED");
        history.setActionAt(LocalDateTime.now());
        historyRepo.save(history);

        Request saved = requestRepo.save(req);

        auditLogService.log(
                saved.getId(),
                saved.getWorkflowId(),
                level,
                history.getRole(),
                dto.getApproverId(),
                "REJECTED",
                oldStatus,
                "REJECTED",
                dto.getRemarks()   // ✅ remarks in audit
        );

        return saved;
    }


    // ================= ROLE BASED =================
    public List<Map<String, Object>> getPendingForManagerWithNames(Long managerId) {

        return requestRepo.findPendingForApprover(managerId, "MANAGER")
                .stream()
                .map(r -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("request", r);
                    m.put("initiatorName",
                            userRepo.findById(r.getInitiatorId())
                                    .map(User::getName).orElse("Unknown"));
                    return m;
                }).toList();
    }


    public List<Map<String, Object>> getPendingForFinanceWithNames(Long financeId) {

        return requestRepo.findPendingForApprover(financeId, "FINANCE")
                .stream()
                .map(r -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("request", r);
                    m.put("initiatorName",
                            userRepo.findById(r.getInitiatorId())
                                    .map(User::getName).orElse("Unknown"));
                    return m;
                }).toList();
    }

    public List<Map<String, Object>> getRequestsSummary() {

        List<Map<String, Object>> result = new ArrayList<>();

        for (Request r : requestRepo.findAll()) {

            Map<String, Object> map = new HashMap<>();
            map.put("request", r);

            map.put("initiatorName",
                    userRepo.findById(r.getInitiatorId())
                            .map(User::getName).orElse("Unknown"));

            List<AuditLog> logs = auditRepo.findByRequestId(r.getId());

            map.put("totalApprovals", logs.size());

            logs.stream()
                    .max(Comparator.comparing(AuditLog::getActionAt))
                    .ifPresent(log -> {
                        Map<String, Object> last = new HashMap<>();
                        last.put("approverName",
                                userRepo.findById(log.getApproverId())
                                        .map(User::getName).orElse("Unknown"));
                        last.put("action", log.getAction());
                        last.put("actionAt", log.getActionAt());
                        map.put("lastAction", last);
                    });

            result.add(map);
        }
        return result;
    }

}
