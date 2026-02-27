package com.example.auto.repository;

import com.example.auto.model.ChatHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatHistoryRepository extends JpaRepository<ChatHistory, Long> {
    List<ChatHistory> findByUserIdOrderByTimestampDesc(Long userId);

    List<ChatHistory> findTop5ByUserIdOrderByTimestampDesc(Long userId);
}
