package com.example.auto.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OllamaRequest {
    private String model;
    private List<OllamaMessage> messages;
    private boolean stream;
}
