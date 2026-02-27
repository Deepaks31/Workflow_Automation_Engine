package com.example.auto.service;

import com.example.auto.model.Request;
import com.example.auto.model.Workflow;
import com.example.auto.repository.RequestRepository;
import com.example.auto.repository.WorkflowRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RuleEngine {

    private final WorkflowRepository workflowRepository;
    private final RequestRepository requestRepository;

    public String getResponse(String role, String message, Long userId) {
        String query = message.toLowerCase().trim();

        if (role == null) {
            return getFallbackResponse();
        }

        switch (role.toUpperCase()) {
            case "ADMIN":
                return handleAdminQuery(query);
            case "INITIATOR":
                return handleInitiatorQuery(query, userId);
            case "MANAGER":
                return handleManagerQuery(query);
            case "FINANCE":
                return handleFinanceQuery(query);
            case "AUDITOR":
                return handleAuditorQuery(query);
            default:
                return getFallbackResponse();
        }
    }

    private String handleAdminQuery(String query) {
        if (query.contains("active workflows")) {
            List<Workflow> activeWorkflows = workflowRepository.findByStatus("ACTIVE");
            return "There are currently " + activeWorkflows.size() + " active workflows in the system.";
        } else if (query.contains("pending escalations") || query.contains("escalation")) {
            List<Request> escalated = requestRepository.findByStatusStartingWith("ESCALATED");
            return "There are " + escalated.size() + " pending escalations.";
        } else if (query.contains("system performance") || query.contains("performance")) {
            long totalRequests = requestRepository.count();
            List<Request> approved = requestRepository.findByStatus("APPROVED");
            List<Request> rejected = requestRepository.findByStatus("REJECTED");
            return String.format("System Summary: %d total requests, %d approved, %d rejected.",
                    totalRequests, approved.size(), rejected.size());
        } else if (query.contains("create workflow help") || query.contains("help")) {
            return "To create a workflow, go to the Designer tab, drag and drop nodes (Start, Approval, Condition, End), configure their properties in the sidebar, add condition rules if needed, and click Save Workflow.";
        }
        return getFallbackResponse();
    }

    private String handleInitiatorQuery(String query, Long userId) {
        if (query.contains("status of my request") || query.contains("my request status")) {
            List<Request> myRequests = requestRepository.findByInitiatorId(userId);
            if (myRequests.isEmpty()) {
                return "You do not have any recent requests.";
            }
            Request latest = myRequests.get(myRequests.size() - 1);
            return "Your latest request (ID: " + latest.getId() + ") is currently: **" + latest.getStatus()
                    + "** at level " + latest.getCurrentLevel() + ".";
        } else if (query.contains("delayed") || query.contains("why is my request delayed")) {
            return "Requests may be delayed if the assigned approver is reviewing it. If the SLA is exceeded, it will be escalated automatically. You can check the specific status in your Initiator Dashboard.";
        } else if (query.contains("raise new request") || query.contains("how to raise")) {
            return "Go to 'Raise Request', select the appropriate Workflow from the dropdown, fill out the required JSON fields or amount, and submit.";
        } else if (query.contains("rejected request reason") || query.contains("why rejected")) {
            List<Request> myRequests = requestRepository.findByInitiatorId(userId);
            Request rejected = myRequests.stream().filter(r -> "REJECTED".equals(r.getStatus()))
                    .reduce((first, second) -> second).orElse(null);
            if (rejected != null) {
                return "Your last rejected request remarks: "
                        + (rejected.getRemarks() != null ? rejected.getRemarks() : "No remarks provided.");
            }
            return "You do not have any recently rejected requests.";
        }
        return getFallbackResponse();
    }

    private String handleManagerQuery(String query) {
        if (query.contains("approvals pending") || query.contains("pending approvals")) {
            List<Request> pending = requestRepository.findPendingForRole("MANAGER");
            return "There are " + pending.size() + " approvals pending for the Manager role.";
        } else if (query.contains("urgent approvals") || query.contains("urgent")) {
            // Simplified logic: anything escalated or pending long
            List<Request> escalated = requestRepository.findByStatusStartingWith("ESCALATED");
            return "You have " + escalated.size() + " highly urgent/escalated requests requiring immediate attention.";
        } else if (query.contains("statistics") || query.contains("approval statistics")) {
            return "Check the Dashboard for comprehensive statistics. Total requests in system are actively managed.";
        }
        return getFallbackResponse();
    }

    private String handleFinanceQuery(String query) {
        if (query.contains("pending payments") || query.contains("payment")) {
            List<Request> pending = requestRepository.findPendingForRole("FINANCE");
            return "There are " + pending.size() + " payment approvals currently pending for the Finance team.";
        } else if (query.contains("high value")) {
            return "To view high value requests, checking the active workflows utilizing condition values > 10000 in the Dashboard.";
        }
        return getFallbackResponse();
    }

    private String handleAuditorQuery(String query) {
        if (query.contains("audit logs") || query.contains("show logs")) {
            return "You can view recent comprehensive system logs in the 'Audit Logs' tab from your Auditor Dashboard.";
        } else if (query.contains("sla violations") || query.contains("violations")) {
            List<Request> escalated = requestRepository.findByStatusStartingWith("ESCALATED");
            return "There are currently " + escalated.size() + " workflows with SLA violations (Escalated status).";
        } else if (query.contains("audit summary") || query.contains("generate summary")) {
            long total = requestRepository.count();
            List<Request> escalated = requestRepository.findByStatusStartingWith("ESCALATED");
            return String.format("Audit Summary: Out of %d total records, %d requests breached SLAs.", total,
                    escalated.size());
        }
        return getFallbackResponse();
    }

    private String getFallbackResponse() {
        return "I'm your Workflow Assistant. I can help you with:\n" +
                "- Request status\n" +
                "- Pending approvals\n" +
                "- Workflow statistics\n" +
                "- SLA tracking\n" +
                "Please ask a system-related question.";
    }
}
