package com.example.auto.repository;

import com.example.auto.model.Workflow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface WorkflowRepository extends JpaRepository<Workflow, Long> {
    List<Workflow> findByStatus(String status);

    @Query("""
SELECT w FROM Workflow w
LEFT JOIN FETCH w.approvalLevels
WHERE w.id = :id
""")
    Workflow findByIdWithLevels(@Param("id") Long id);

}
