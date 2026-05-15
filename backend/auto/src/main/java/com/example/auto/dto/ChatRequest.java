package com.example.auto.dto;

import lombok.Data;

@Data
public class ChatRequest {
    private Long userId;
    private String role;
    private String message;
}
