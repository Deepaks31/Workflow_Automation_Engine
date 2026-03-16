package com.example.auto.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
public class MeetingDto {
    private String title;
    private String description;
    private LocalDate meetingDate;
    private LocalTime meetingTime;
    private Integer durationMinutes;
    private String meetingLink;
    private Long creatorId;
    private List<Long> participantIds;
}
