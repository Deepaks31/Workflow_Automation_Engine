package com.example.auto.service;

import com.example.auto.dto.MeetingDto;
import com.example.auto.model.Meeting;
import com.example.auto.model.User;
import com.example.auto.repository.MeetingRepository;
import com.example.auto.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class MeetingService {

    private final MeetingRepository meetingRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public Meeting createMeeting(MeetingDto dto) {
        User creator = userRepository.findById(dto.getCreatorId())
                .orElseThrow(() -> new RuntimeException("Creator not found"));

        if ("INITIATOR".equalsIgnoreCase(creator.getRole())) {
            throw new RuntimeException("Initiator cannot create meetings");
        }

        Meeting meeting = new Meeting();
        meeting.setTitle(dto.getTitle());
        meeting.setDescription(dto.getDescription());
        meeting.setMeetingDate(dto.getMeetingDate());
        meeting.setMeetingTime(dto.getMeetingTime());
        meeting.setDurationMinutes(dto.getDurationMinutes());
        meeting.setMeetingLink(dto.getMeetingLink());
        meeting.setCreatedBy(creator);

        Set<User> participants = new HashSet<>();
        if (dto.getParticipantIds() != null && !dto.getParticipantIds().isEmpty()) {
            for (Long participantId : dto.getParticipantIds()) {
                userRepository.findById(participantId).ifPresent(participants::add);
            }
        }
        // Always include creator
        participants.add(creator);
        meeting.setParticipants(participants);

        Meeting savedMeeting = meetingRepository.save(meeting);

        // Send notifications to all participants EXCEPT creator
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("hh:mm a");
        for (User p : participants) {
            // Include creator in this notification as requested or just the others. Let's send to all.
            String message = String.format("You have been invited to a meeting: %s at %s", 
                savedMeeting.getTitle(), 
                savedMeeting.getMeetingTime().format(timeFormatter));
                
            notificationService.createNotification(
                p.getId(),
                "New Meeting Invitation",
                message,
                "MEETING",
                savedMeeting.getId()
            );
        }

        return savedMeeting;
    }

    public List<Meeting> getMeetingsForUser(Long userId) {
        return meetingRepository.findByParticipants_IdOrderByMeetingDateDescMeetingTimeDesc(userId);
    }

    public Meeting getMeetingById(Long id) {
        return meetingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Meeting not found"));
    }
}
