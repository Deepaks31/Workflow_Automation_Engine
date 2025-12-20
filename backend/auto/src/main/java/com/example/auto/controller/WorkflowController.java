package com.example.auto.controller;

import com.example.auto.model.Workflow;
import com.example.auto.service.WorkflowService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/workflows")
public class WorkflowController {

    @Autowired
    private WorkflowService workflowService;

    @PostMapping
    public Workflow create(@RequestBody Workflow workflow) {
        return workflowService.createWorkflow(workflow);
    }

    @GetMapping
    public List<Workflow> all() {
        return workflowService.getAll();
    }

    @PutMapping("/{id}")
    public Workflow update(
            @PathVariable Long id,
            @RequestBody Workflow workflow
    ) {
        return workflowService.update(id, workflow);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        workflowService.delete(id);
    }
}
