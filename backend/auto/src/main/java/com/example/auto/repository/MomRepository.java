package com.example.auto.repository;

import com.example.auto.model.Mom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MomRepository extends JpaRepository<Mom, Long> {
    Optional<Mom> findByMeetingId(Long meetingId);
}
