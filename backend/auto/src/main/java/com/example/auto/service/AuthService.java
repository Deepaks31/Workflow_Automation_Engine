package com.example.auto.service;

import com.example.auto.dto.LoginRequest;
import com.example.auto.model.User;
import com.example.auto.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private PasswordEncoder encoder;

    public User login(LoginRequest request) {
        User user = userRepo.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!encoder.matches(request.getPassword(), user.getPassword()))
            throw new RuntimeException("Invalid password");

        if (!user.getStatus().equals("ACTIVE"))
            throw new RuntimeException("User not approved");

        return user;
    }
}
