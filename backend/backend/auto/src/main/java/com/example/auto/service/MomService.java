package com.example.auto.service;

import com.example.auto.dto.GroqMessage;
import com.example.auto.dto.GroqRequest;
import com.example.auto.dto.GroqResponse;
import com.example.auto.dto.MomDto;
import com.example.auto.model.Meeting;
import com.example.auto.model.Mom;
import com.example.auto.model.User;
import com.example.auto.repository.MeetingRepository;
import com.example.auto.repository.MomRepository;
import com.example.auto.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class MomService {

    private final MomRepository momRepository;
    private final MeetingRepository meetingRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final RestTemplate restTemplate;

    @Value("${groq.api.key}")
    private String groqApiKey;

    private static final String GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

    public Mom createMom(MomDto dto) {
        Meeting meeting = meetingRepository.findById(dto.getMeetingId())
                .orElseThrow(() -> new RuntimeException("Meeting not found"));

        User creator = userRepository.findById(dto.getCreatedBy())
                .orElseThrow(() -> new RuntimeException("Creator not found"));

        Optional<Mom> existing = momRepository.findByMeetingId(dto.getMeetingId());
        if (existing.isPresent()) {
            throw new RuntimeException("MOM already exists for this meeting");
        }

        Mom mom = new Mom();
        mom.setMeeting(meeting);
        mom.setDiscussionPoints(dto.getDiscussionPoints());
        mom.setCreatedBy(creator);
        
        // Mark meeting as completed
        meeting.setStatus("COMPLETED");
        meetingRepository.save(meeting);

        // Process AI Generation if requested
        if (Boolean.TRUE.equals(dto.getGenerateWithAi()) && dto.getDiscussionPoints() != null) {
            try {
                processAiGeneration(mom, dto.getDiscussionPoints());
            } catch (Exception e) {
                log.error("AI Generation failed, falling back to manual inputs", e);
                mom.setKeyDecisions(dto.getKeyDecisions());
                mom.setActionItems(dto.getActionItems());
                mom.setSummary(dto.getSummary() != null ? dto.getSummary() : "AI Generation Failed");
            }
        } else {
            mom.setKeyDecisions(dto.getKeyDecisions());
            mom.setActionItems(dto.getActionItems());
            mom.setSummary(dto.getSummary());
        }

        Mom savedMom = momRepository.save(mom);

        // Send notifications to all participants
        for (User p : meeting.getParticipants()) {
            String message = String.format("MOM has been created for meeting: %s. Please review the decisions and action items.", 
                    meeting.getTitle());
            notificationService.createNotification(
                    p.getId(),
                    "MOM Created",
                    message,
                    "MOM",
                    savedMom.getId()
            );
        }

        return savedMom;
    }

    private void processAiGeneration(Mom mom, String discussionNotes) {
        String systemPrompt = "You are an AI assistant tasked with parsing meeting discussion notes. " +
                "You must strictly return a valid JSON object. " +
                "The JSON object must have exactly three keys: 'summary', 'keyDecisions', and 'actionItems'. " +
                "The VALUE for each of these keys MUST be a single formatted string containing newline characters (\\n) to break the text into multiple lines. " +
                "CRITICAL INSTRUCTION: Ensure EVERY field ('summary', 'keyDecisions', and 'actionItems') is highly detailed, comprehensive, and AT LEAST 500 characters long each. " +
                "Specifically: " +
                "1. 'summary' MUST be written across 3 to 4 distinct paragraphs, separated by double newlines (\\n\\n). " +
                "2. 'keyDecisions' and 'actionItems' MUST be formatted as a detailed list with at least 3 to 4 long bullet points, separated by newlines (\\n). " +
                "Do NOT return JSON arrays. Do not include any dialogue outside the JSON.";

        List<GroqMessage> messages = new ArrayList<>();
        messages.add(new GroqMessage("system", systemPrompt));
        messages.add(new GroqMessage("user", "Here are the discussion notes:\n" + discussionNotes));

        GroqRequest groqRequest = new GroqRequest(
                "llama-3.1-8b-instant",
                messages,
                false
        );
        groqRequest.setResponseFormat(java.util.Collections.singletonMap("type", "json_object"));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + groqApiKey);

        HttpEntity<GroqRequest> entity = new HttpEntity<>(groqRequest, headers);

        GroqResponse groqResponse = restTemplate.postForObject(GROQ_URL, entity, GroqResponse.class);
        if (groqResponse != null && groqResponse.getChoices() != null && !groqResponse.getChoices().isEmpty()) {
            String aiResponse = groqResponse.getChoices().get(0).getMessage().getContent();
            try {
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                com.fasterxml.jackson.databind.JsonNode rootNode = mapper.readTree(aiResponse);
                
                if (rootNode.has("summary")) {
                    com.fasterxml.jackson.databind.JsonNode node = rootNode.get("summary");
                    mom.setSummary(node.isTextual() ? node.asText() : node.toString());
                }
                if (rootNode.has("keyDecisions")) {
                    com.fasterxml.jackson.databind.JsonNode node = rootNode.get("keyDecisions");
                    mom.setKeyDecisions(node.isTextual() ? node.asText() : node.toString());
                }
                if (rootNode.has("actionItems")) {
                    com.fasterxml.jackson.databind.JsonNode node = rootNode.get("actionItems");
                    mom.setActionItems(node.isTextual() ? node.asText() : node.toString());
                }
            } catch (Exception e) {
                log.error("Failed to parse JSON response from Groq", e);
                mom.setSummary(aiResponse); 
            }
        } else {
            throw new RuntimeException("Empty response from Groq AI");
        }
    }

    public List<Mom> getAllMoms() {
        return momRepository.findAll();
    }

    public Mom getMomById(Long id) {
        return momRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("MOM not found"));
    }
    
    public Mom getMomByMeetingId(Long meetingId) {
        return momRepository.findByMeetingId(meetingId)
                .orElse(null);
    }
}