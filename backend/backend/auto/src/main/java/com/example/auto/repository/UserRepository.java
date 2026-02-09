package com.example.auto.repository;

import com.example.auto.enums.UserStatus;
import com.example.auto.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    List<User> findByStatusAndRoleNot(UserStatus status,String role);
}
