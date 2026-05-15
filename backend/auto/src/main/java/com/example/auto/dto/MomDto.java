package com.example.auto.dto;

import lombok.Data;

@Data
public class MomDto {
    private Long meetingId;
    private String discussionPoints;
    private String keyDecisions;
    private String actionItems;
    private String summary;
    private Long createdBy;
    private Boolean generateWithAi; // True if the LLM should generate fields from discussionPoints
}
