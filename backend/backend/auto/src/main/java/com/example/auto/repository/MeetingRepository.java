package com.example.auto.repository;

import com.example.auto.model.Meeting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MeetingRepository extends JpaRepository<Meeting, Long> {
    List<Meeting> findByParticipants_IdOrderByMeetingDateDescMeetingTimeDesc(Long userId);
}
