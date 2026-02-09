package com.example.auto.service;

import org.springframework.stereotype.Service;

public interface EmailService {
    void sendEmail(String to, String subject, String content);
}


//package com.example.auto.service;
//
//import com.example.auto.model.User;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.mail.SimpleMailMessage;
//import org.springframework.mail.javamail.JavaMailSender;
//import org.springframework.stereotype.Service;
//
//@Service
//public class EmailService {
//
//    @Autowired
//    private JavaMailSender mailSender;
//
//    public void sendApprovalMail(User user) {
//        SimpleMailMessage message = new SimpleMailMessage();
//        message.setTo("deepaksuresh3105@gmail.com");
//        message.setSubject("User Signup Approval");
//        message.setText(
//                "Approve user: " + user.getEmail() +
//                        "\n For Role: " + user.getRole() +
//                        "\n Approve User + " +
//                        "Click: https://workflow-automation-backend-i4c5.onrender.com/api/admin/approve/" + user.getId() +
//                        "\n Reject User + " +
//                        "Click: https://workflow-automation-backend-i4c5.onrender.com/api/admin/reject/" + user.getId()
//        );
//        mailSender.send(message);
//    }
//}