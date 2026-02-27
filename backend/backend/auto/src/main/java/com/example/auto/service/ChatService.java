package com.example.auto.service;

import com.example.auto.dto.ChatRequest;
import com.example.auto.dto.ChatResponse;
import com.example.auto.dto.GroqMessage;
import com.example.auto.dto.GroqRequest;
import com.example.auto.dto.GroqResponse;
import com.example.auto.model.ChatMessage;
import com.example.auto.model.Request;
import com.example.auto.model.Workflow;
import com.example.auto.repository.ChatMessageRepository;
import com.example.auto.repository.EscalationHistoryRepository;
import com.example.auto.repository.RequestRepository;
import com.example.auto.repository.WorkflowRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final RestTemplate restTemplate;

    // Dashboard dependencies
    private final RequestRepository requestRepository;
    private final EscalationHistoryRepository escalationHistoryRepository;
    private final WorkflowRepository workflowRepository;

    @Value("${groq.api.key}")
    private String groqApiKey;

    private static final String GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

    public ChatResponse processChatRequest(ChatRequest request) {
        // Fetch previous conversation history
        List<ChatMessage> history = chatMessageRepository.findByUserIdOrderByTimestampAsc(request.getUserId());

        // Construct the system prompt
        String role = request.getRole() != null ? request.getRole() : "UNKNOWN";
        String normalizedQuery = request.getMessage().toLowerCase().trim();

        // Fetch Dashboard Context
        String fetchedData = fetchRelatedData(normalizedQuery, request.getUserId(), role);

        String systemPrompt = "You are Antigravity AI, an intelligent enterprise workflow assistant designed to support workflow automation processes. "
                +
                "You help users with approvals, SLA escalation, finance validation, audit tracking, and request summaries. "
                +
                "Provide clear, professional, and concise responses. If you are unsure about something, say you do not know instead of guessing. "
                +
                "The current user's role is " + role + ".\n\n" +
                "Dashboard Context Data:\n" + fetchedData;

        List<GroqMessage> messages = new ArrayList<>();
        messages.add(new GroqMessage("system", systemPrompt));

        // Add history (limiting to last 10 messages to avoid token bloat)
        int historySize = history.size();
        int startIndex = Math.max(0, historySize - 10);
        for (int i = startIndex; i < historySize; i++) {
            ChatMessage msg = history.get(i);
            messages.add(new GroqMessage("user", msg.getMessage()));
            messages.add(new GroqMessage("assistant", msg.getResponse()));
        }

        messages.add(new GroqMessage("user", request.getMessage()));

        // Create the Groq request (using mixtral-8x7b-32768)
        GroqRequest groqRequest = new GroqRequest(
                "llama-3.1-8b-instant",
                messages,
                false // stream
        );

        String aiResponse = "";
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + groqApiKey);

            HttpEntity<GroqRequest> entity = new HttpEntity<>(groqRequest, headers);

            // Call Groq API
            GroqResponse groqResponse = restTemplate.postForObject(GROQ_URL, entity, GroqResponse.class);
            if (groqResponse != null && groqResponse.getChoices() != null && !groqResponse.getChoices().isEmpty()) {
                aiResponse = groqResponse.getChoices().get(0).getMessage().getContent();
            } else {
                aiResponse = "Error: Received empty response from Groq AI.";
            }
        } catch (Exception e) {
            aiResponse = "Error connecting to AI service: " + e.getMessage();
            log.error("Error communicating with Groq API", e);
        }

        // Save conversation history to ChatMessage database table
        ChatMessage messageLog = new ChatMessage();
        messageLog.setUserId(request.getUserId());
        messageLog.setRole(role);
        messageLog.setMessage(request.getMessage());
        messageLog.setResponse(aiResponse);

        chatMessageRepository.save(messageLog);

        return new ChatResponse(aiResponse);
    }

    private String fetchRelatedData(String message, Long userId, String role) {
        StringBuilder data = new StringBuilder();

        if (message.contains("pending") || message.contains("approval") || message.contains("status")) {
            List<Request> pendingRequests;
            if ("INITIATOR".equalsIgnoreCase(role)) {
                pendingRequests = requestRepository.findByInitiatorId(userId).stream()
                        .filter(r -> r.getStatus() != null && r.getStatus().startsWith("PENDING"))
                        .collect(Collectors.toList());
            } else {
                pendingRequests = requestRepository.findPendingForRole(role.toUpperCase());
            }

            // SLA Risk Detection
            List<Workflow> allWorkflows = workflowRepository.findAll();
            Map<Long, Workflow> wfMap = allWorkflows.stream().collect(Collectors.toMap(Workflow::getId, w -> w));

            List<String> formattedRequests = pendingRequests.stream().limit(5).map(r -> {
                Workflow wf = wfMap.get(r.getWorkflowId());
                boolean risk = false;
                if (wf != null && wf.getEscalationHours() > 0 && r.getLastActionAt() != null) {
                    long hoursPassed = java.time.Duration.between(r.getLastActionAt(), LocalDateTime.now()).toHours();
                    if (hoursPassed >= (wf.getEscalationHours() * 0.7)) {
                        risk = true;
                    }
                }
                return String.format("[ID: %d, WorkflowID: %d, Status: %s]%s",
                        r.getId(), r.getWorkflowId(), r.getStatus(), risk ? " [High Risk of SLA Breach]" : "");
            }).collect(Collectors.toList());

            if (!formattedRequests.isEmpty()) {
                data.append("Pending/Recent Requests: ").append(String.join(", ", formattedRequests)).append("\n");
            }
        }

        if (message.contains("sla") || message.contains("breach")) {
            long count = escalationHistoryRepository.count();
            data.append("SLA Breach/Escalation Count: ").append(count).append("\n");
        }

        if (message.contains("metric") || message.contains("performance")) {
            LocalDateTime lastMonth = LocalDateTime.now().minusMonths(1);
            List<Object[]> stats = requestRepository.findApprovedCountsByMonthSince(lastMonth);
            data.append("Performance Metrics (Recent Approved counts): ");
            for (Object[] stat : stats) {
                data.append(stat[0]).append(": ").append(stat[1]).append(", ");
            }
            data.append("\n");
        }

        if (data.length() == 0) {
            data.append("No specific basic workflow data needed or found for this query.");
        }

        return data.toString();
    }
}
