package com.example.auto.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GroqMessage {
    private String role; // "system", "user", "assistant"
    private String content;
}
