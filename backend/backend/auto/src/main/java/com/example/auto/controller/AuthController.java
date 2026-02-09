package com.example.auto.controller;

import com.example.auto.dto.LoginRequest;
import com.example.auto.dto.SignupRequest;
import com.example.auto.model.User;
import com.example.auto.service.AdminMailService;
import com.example.auto.service.AdminMailService;
import com.example.auto.service.AuthService;
import com.example.auto.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin

public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private AdminMailService adminMailService;

    @Autowired
    private AuthService authService;

    @PostMapping("/signup")
    public String signup(@RequestBody SignupRequest request) {

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());
        user.setRole(request.getRole());

        User saved = userService.register(user);

        adminMailService.sendApprovalMail(saved);

        return "Signup request sent for approval";
    }

    @PostMapping("/login")
    public User login(@RequestBody LoginRequest request) {
        return authService.login(request);
    }
}
