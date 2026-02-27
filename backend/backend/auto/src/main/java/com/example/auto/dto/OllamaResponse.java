package com.example.auto.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class OllamaResponse {
    private String model;
    private String created_at;
    private OllamaMessage message;
    private boolean done;
}
