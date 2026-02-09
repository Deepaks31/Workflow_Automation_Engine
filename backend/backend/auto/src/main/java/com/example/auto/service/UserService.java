package com.example.auto.service;

import com.example.auto.enums.UserStatus;
import com.example.auto.model.User;
import com.example.auto.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private PasswordEncoder encoder;

    public User register(User user) {
        user.setPassword(encoder.encode(user.getPassword()));
        user.setStatus(UserStatus.PENDING);
        return userRepo.save(user);
    }
    public List<User> getActiveUsers() {
        return userRepo.findByStatusAndRoleNot(UserStatus.ACTIVE,"ADMIN");
    }
    public User approveUser(Long id) {
        User user = userRepo.findById(id)
                .orElseThrow();
        user.setStatus(UserStatus.ACTIVE);
        return userRepo.save(user);
    }
    public void rejectUser(Long id) {
        User user = userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setStatus(UserStatus.REJECTED);   // or user.setStatus("REJECTED");
        userRepo.save(user);
    }
}
