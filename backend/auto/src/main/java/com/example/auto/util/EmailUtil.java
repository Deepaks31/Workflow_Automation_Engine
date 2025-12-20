package com.example.auto.util;

public class EmailUtil {
    public static String approvalLink(Long id) {
        return "http://localhost:8080/api/admin/approve/" + id;
    }
}
