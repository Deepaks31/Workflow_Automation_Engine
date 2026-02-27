package com.example.auto.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
public class GroqResponse {
    private List<GroqChoice> choices;

    @Data
    @NoArgsConstructor
    public static class GroqChoice {
        private GroqMessage message;
    }
}
