package com.example.auto.controller;

import com.example.auto.dto.MeetingDto;
import com.example.auto.model.Meeting;
import com.example.auto.service.MeetingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/meetings")
@CrossOrigin
@RequiredArgsConstructor
public class MeetingController {

    private final MeetingService meetingService;

    @PostMapping
    public ResponseEntity<Meeting> createMeeting(@RequestBody MeetingDto dto) {
        return ResponseEntity.ok(meetingService.createMeeting(dto));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Meeting>> getMeetingsForUser(@PathVariable("userId") Long userId) {
        return ResponseEntity.ok(meetingService.getMeetingsForUser(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Meeting> getMeetingById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(meetingService.getMeetingById(id));
    }
}
