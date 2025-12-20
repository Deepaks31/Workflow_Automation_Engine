package com.example.auto.dto;

import lombok.Data;

import java.util.Map;

@Data
public class RequestDTO {
    private Long workflowId;
    private Long initiatorId;
    private Map<String, Object> data;
}
