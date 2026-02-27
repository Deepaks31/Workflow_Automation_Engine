package com.example.auto.controller;

import com.example.auto.dto.ChatRequest;
import com.example.auto.dto.ChatResponse;
import com.example.auto.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Allow frontend integration
public class ChatController {

    private final ChatService chatService;

    @PostMapping
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest chatRequest) {
        if (chatRequest.getMessage() == null || chatRequest.getMessage().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new ChatResponse("Message cannot be empty"));
        }
        if (chatRequest.getUserId() == null) {
            return ResponseEntity.badRequest().body(new ChatResponse("User ID is required"));
        }
        if (chatRequest.getRole() == null || chatRequest.getRole().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new ChatResponse("Role is required"));
        }

        try {
            ChatResponse response = chatService.processChatRequest(chatRequest);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new ChatResponse("An error occurred: " + e.getMessage()));
        }
    }
}
