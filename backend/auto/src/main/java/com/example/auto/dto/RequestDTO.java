package com.example.auto.dto;

import lombok.Data;

import java.util.Map;

@Data
public class RequestDTO {
    private Long workflowId;
    private Long initiatorId;
    private String remarks;
    private Map<String, Object> data;



    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
}
