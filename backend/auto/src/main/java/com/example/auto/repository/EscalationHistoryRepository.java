package com.example.auto.repository;

import com.example.auto.model.EscalationHistory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EscalationHistoryRepository
        extends JpaRepository<EscalationHistory, Long> {
}
