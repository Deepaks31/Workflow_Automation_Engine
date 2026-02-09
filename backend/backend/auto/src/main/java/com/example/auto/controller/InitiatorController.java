package com.example.auto.controller;

import com.example.auto.model.Workflow;
import com.example.auto.service.WorkflowService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;


@RestController
@RequestMapping("/api/initiator/workflows")
@CrossOrigin
public class InitiatorController {

    @Autowired
    private WorkflowService workflowService;

    @GetMapping
    public List<Workflow> getAvailableWorkflows() {
        return workflowService.getActiveWorkflows();
    }
}

