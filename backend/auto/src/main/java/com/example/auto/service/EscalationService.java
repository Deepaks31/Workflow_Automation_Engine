package com.example.auto.service;

import com.example.auto.model.*;
import com.example.auto.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Duration;
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

    /**
     * Runs every 1 minute
     * Escalation is based on HOURS configured by Admin
     */
    @Scheduled(fixedRate = 60000)
    @Transactional
    public void processEscalations() {

        List<Request> pendingRequests =
                requestRepo.findByStatusStartingWith("PENDING");


        LocalDateTime now = LocalDateTime.now();

        for (Request req : pendingRequests) {

            Workflow workflow = workflowRepo
                    .findById(req.getWorkflowId())
                    .orElse(null);

            if (workflow == null) continue;

            // Admin-configured escalation hours
            int escalationHours = workflow.getEscalationHours();
            if (escalationHours <= 0) continue;

            LocalDateTime lastActionAt = req.getLastActionAt();
            if (lastActionAt == null) continue;

            long hoursPassed =
                    Duration.between(lastActionAt, now).toHours();

            if (hoursPassed >= escalationHours) {
                escalate(req, workflow);
            }
        }
    }

    /**
     * Escalates request to next approval level
     */
    private void escalate(Request req, Workflow wf) {

        int currentLevel = req.getCurrentLevel();
        int nextLevel = currentLevel + 1;

        EscalationHistory history = new EscalationHistory();
        history.setRequestId(req.getId());
        history.setFromLevel(currentLevel);
        history.setActionAt(LocalDateTime.now());

        boolean hasNextLevel = wf.getApprovalLevels()
                .stream()
                .anyMatch(l -> l.getLevelNo() == nextLevel);

        if (hasNextLevel) {

            // 🔼 Escalate to next level
            req.setCurrentLevel(nextLevel);
            req.setStatus("ESCALATED_" + currentLevel);
            req.setLastActionAt(LocalDateTime.now());

            history.setToLevel(nextLevel);
            history.setAction("ESCALATED");
            history.setReason("Approval SLA breached");

        } else {

            // ❌ Auto reject
            req.setStatus("zREJECTED");

            history.setAction("AUTO_REJECTED");
            history.setReason("No further approval levels");
        }

        historyRepo.save(history);
        requestRepo.save(req);
    }

}
