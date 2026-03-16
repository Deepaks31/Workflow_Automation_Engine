package com.example.auto.controller;

import com.example.auto.model.User;
import com.example.auto.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/role/{role}")
    public List<User> getUsersByRole(@PathVariable("role") String role) {
        return userService.getUsersByRole(role);
    }
}
