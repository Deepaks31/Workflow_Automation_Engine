package com.example.auto.controller;

import com.example.auto.model.User;
import com.example.auto.model.Workflow;
import com.example.auto.service.UserService;
import com.example.auto.service.WorkflowService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private UserService userService;

    @GetMapping("/users")
    public List<User> getActiveUsers() {
        return userService.getActiveUsers();
    }
    @PutMapping("/users/{id}/revoke")
    public String revokeAccess(@PathVariable("id") Long id) {
        userService.rejectUser(id);
        return "User access revoked";
    }

    @GetMapping("/approve/{id}")
    public String approve(@PathVariable("id") Long id) {
        userService.approveUser(id);
        return "User approved successfully";
    }

    @GetMapping("/reject/{id}")
    public String reject(@PathVariable("id") Long id) {
        userService.rejectUser(id);
        return "User rejected successfully";
    }

    @RequestMapping("/api/admin/workflows")
    @CrossOrigin
    public class AdminWorkflowController {

        @Autowired
        private WorkflowService workflowService;

        @PostMapping
        public Workflow createWorkflow(@RequestBody Workflow workflow) {
            return workflowService.createWorkflow(workflow);
        }
    }


}
