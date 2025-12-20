package com.example.auto.service;

import com.example.auto.model.Workflow;
import com.example.auto.repository.WorkflowRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WorkflowService {

    @Autowired
    private WorkflowRepository workflowRepository;

    public Workflow createWorkflow(Workflow workflow) {
        workflow.setStatus("ACTIVE");
        if (workflow.getApprovalLevels() != null) {
            workflow.getApprovalLevels().forEach(level -> level.setWorkflow(workflow));
        }
        return workflowRepository.save(workflow);
    }


    public List<Workflow> getActiveWorkflows() {
        return workflowRepository.findByStatus("ACTIVE");
    }

    public List<Workflow> getAll() {
        return workflowRepository.findAll(); // fetches all workflows from DB
    }

    public Workflow create(Workflow workflow) {
        workflow.setStatus("ACTIVE");

        workflow.getApprovalLevels()
                .forEach(a -> a.setWorkflow(workflow));

        return workflowRepository.save(workflow);
    }

    public Workflow update(Long id, Workflow updated) {
        Workflow existing = workflowRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Workflow not found"));

        existing.setName(updated.getName());
        existing.setDescription(updated.getDescription());
        existing.setConditionField(updated.getConditionField());
        existing.setConditionOperator(updated.getConditionOperator());
        existing.setConditionValue(updated.getConditionValue());

        existing.getApprovalLevels().clear();
        updated.getApprovalLevels().forEach(a -> {
            a.setWorkflow(existing);
            existing.getApprovalLevels().add(a);
        });

        return workflowRepository.save(existing);
    }

    public void delete(Long id) {
        workflowRepository.deleteById(id);
    }
}

