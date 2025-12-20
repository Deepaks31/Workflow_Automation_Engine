package com.example.auto.service;

import com.example.auto.model.User;
import com.example.auto.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private PasswordEncoder encoder;

    public User register(User user) {
        user.setPassword(encoder.encode(user.getPassword()));
        user.setStatus("PENDING");
        return userRepo.save(user);
    }

    public User approveUser(Long id) {
        User user = userRepo.findById(id).orElseThrow();
        user.setStatus("ACTIVE");
        return userRepo.save(user);
    }
    public void rejectUser(Long id) {
        User user = userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setStatus("REJECTED");   // or user.setStatus("REJECTED");
        userRepo.save(user);
    }
}
