package com.example.auto.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handle(RuntimeException ex) {
        Map<String, String> response = new HashMap<>();
        // Simplify Duplicate Entry message
        if (ex.getMessage() != null && ex.getMessage().contains("Duplicate entry")) {
            response.put("error", "Email already exists.");
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
        
        response.put("error", ex.getMessage());
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
