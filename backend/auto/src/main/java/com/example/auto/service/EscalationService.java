package com.example.auto.service;

import com.example.auto.model.*;
import com.example.auto.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class EscalationService {

    @Autowired
    private RequestRepository requestRepo;

    @Autowired
    private WorkflowRepository workflowRepo;

    @Autowired
    private EscalationHistoryRepository historyRepo;

    // runs every 1 minute
    @Scheduled(fixedRate = 60000)
    public void processEscalations() {

        List<Request> requests =
                requestRepo.findByStatusStartingWith("PENDING");

        for (Request req : requests) {

            Workflow wf = workflowRepo.findById(req.getWorkflowId())
                    .orElseThrow();

            ApprovalLevel level = wf.getApprovalLevels().stream()
                    .filter(l -> l.getLevelNo() == req.getCurrentLevel())
                    .findFirst().orElseThrow();

            LocalDateTime expiry =
                    req.getLastActionAt().plusHours(level.getEscalationHours());

            if (LocalDateTime.now().isAfter(expiry)) {
                escalate(req, wf);
            }
        }
    }

    private void escalate(Request req, Workflow wf) {

        int current = req.getCurrentLevel();
        int next = current + 1;

        EscalationHistory h = new EscalationHistory();
        h.setRequestId(req.getId());
        h.setFromLevel(current);
        h.setActionAt(LocalDateTime.now());

        boolean hasNext = wf.getApprovalLevels().stream()
                .anyMatch(l -> l.getLevelNo() == next);

        if (hasNext) {
            req.setCurrentLevel(next);
            req.setStatus("ESCALATED_" + current);
            req.setLastActionAt(LocalDateTime.now());

            h.setToLevel(next);
            h.setAction("ESCALATED");
            h.setReason("SLA breached");

        } else {
            req.setStatus("REJECTED");

            h.setAction("AUTO_REJECTED");
            h.setReason("No next level");
        }

        historyRepo.save(h);
        requestRepo.save(req);
    }
}
