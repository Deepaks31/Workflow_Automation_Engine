package com.example.auto.util;

public class EmailUtil {
    public static String approvalLink(Long id) {
        return "https://workflow-automation-backend-i4c5.onrender.com/api/admin/approve/" + id;
    }
}
