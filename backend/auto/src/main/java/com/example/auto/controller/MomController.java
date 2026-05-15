package com.example.auto.controller;

import com.example.auto.dto.MomDto;
import com.example.auto.model.Mom;
import com.example.auto.service.MomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/moms")
@CrossOrigin
@RequiredArgsConstructor
public class MomController {

    private final MomService momService;

    @PostMapping
    public ResponseEntity<Mom> createMom(@RequestBody MomDto dto) {
        return ResponseEntity.ok(momService.createMom(dto));
    }

    @GetMapping
    public ResponseEntity<List<Mom>> getAllMoms() {
        return ResponseEntity.ok(momService.getAllMoms());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Mom> getMomById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(momService.getMomById(id));
    }

    @GetMapping("/meeting/{meetingId}")
    public ResponseEntity<Mom> getMomByMeetingId(@PathVariable("meetingId") Long meetingId) {
        Mom mom = momService.getMomByMeetingId(meetingId);
        if (mom == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(mom);
    }
}
