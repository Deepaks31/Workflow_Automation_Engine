package com.example.auto.service;

import com.example.auto.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendApprovalMail(User user) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo("deepaksuresh3105@gmail.com");
        message.setSubject("User Signup Approval");
        message.setText(
                "Approve user: " + user.getEmail() +
                        "\n For Role: " + user.getRole() +
                        "\n Approve User + " +
                        "Click: http://localhost:8080/api/admin/approve/" + user.getId() +
                        "\n Reject User + " +
                        "Click: http://localhost:8080/api/admin/reject/" + user.getId()
        );
        mailSender.send(message);
    }
}
