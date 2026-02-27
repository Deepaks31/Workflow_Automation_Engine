package com.example.auto.dto;

import lombok.Data;

@Data
public class ChatResponse {
    private String response;

    public ChatResponse() {
    }

    public ChatResponse(String response) {
        this.response = response;
    }
}
