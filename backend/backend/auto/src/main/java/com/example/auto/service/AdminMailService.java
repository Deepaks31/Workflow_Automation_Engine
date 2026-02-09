package com.example.auto.service;

import com.example.auto.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AdminMailService {

    @Autowired
    private EmailService emailService;

    public void sendApprovalMail(User user) {

        String content = """
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
</head>
<body style="margin:0;padding:0;background-color:#f4f6f8;">
  <table width="100%%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:30px 0;">
        <table width="600" cellpadding="0" cellspacing="0"
               style="background:#ffffff;border-radius:8px;
               box-shadow:0 2px 8px rgba(0,0,0,0.05);
               font-family:Arial,sans-serif;">

          <!-- Header -->
          <tr>
            <td style="padding:20px 30px;border-bottom:1px solid #eaeaea;">
              <h2 style="margin:0;color:#333;">
                User Signup Approval
              </h2>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:20px 30px;color:#444;font-size:14px;">
              <p>A new user has registered and requires your approval.</p>

              <table width="100%%" cellpadding="6" cellspacing="0"
                     style="background:#f9fafb;border-radius:6px;">
                <tr>
                  <td><b>Name</b></td>
                  <td>%s</td>
                </tr>
                <tr>
                  <td><b>Email</b></td>
                  <td>%s</td>
                </tr>
                <tr>
                  <td><b>Role</b></td>
                  <td>%s</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Actions -->
          <tr>
            <td style="padding:20px 30px;text-align:center;">
              <a href="http://localhost:8080/api/admin/approve/%d"
                 style="display:inline-block;padding:12px 24px;
                 background:#28a745;color:#ffffff;
                 text-decoration:none;border-radius:5px;
                 font-weight:bold;margin-right:10px;">
                 ✅ Approve
              </a>

              <a href="http://localhost:8080/api/admin/reject/%d"
                 style="display:inline-block;padding:12px 24px;
                 background:#dc3545;color:#ffffff;
                 text-decoration:none;border-radius:5px;
                 font-weight:bold;">
                 ❌ Reject
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:15px 30px;font-size:12px;
                       color:#888;text-align:center;
                       border-top:1px solid #eaeaea;">
              Workflow Automation System<br/>
              This is an automated email. Please do not reply.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
""".formatted(
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getId(),
                user.getId()
        );

        String subject =
                "User Access Approval Required | " +
                        user.getName() + " (" + user.getRole() + ")";



        emailService.sendEmail(
                "deepaksuresh3105@gmail.com",
                subject,
                content
        );
    }
}
