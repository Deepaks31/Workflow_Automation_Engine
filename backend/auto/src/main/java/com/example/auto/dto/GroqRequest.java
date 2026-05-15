package com.example.auto.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GroqRequest {
    private String model;
    private List<GroqMessage> messages;
    private boolean stream;
    
    @com.fasterxml.jackson.annotation.JsonProperty("response_format")
    private java.util.Map<String, String> responseFormat;

    public GroqRequest(String model, List<GroqMessage> messages, boolean stream) {
        this.model = model;
        this.messages = messages;
        this.stream = stream;
    }
}
