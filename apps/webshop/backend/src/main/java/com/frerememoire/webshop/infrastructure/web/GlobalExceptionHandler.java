package com.frerememoire.webshop.infrastructure.web;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final String ACCOUNT_LOCKED_MESSAGE =
            "アカウントがロックされています";

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeException(
            RuntimeException ex) {
        if (ACCOUNT_LOCKED_MESSAGE.equals(ex.getMessage())) {
            return ResponseEntity
                    .status(HttpStatus.LOCKED)
                    .body(Map.of("error", ex.getMessage()));
        }

        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", ex.getMessage()));
    }
}
