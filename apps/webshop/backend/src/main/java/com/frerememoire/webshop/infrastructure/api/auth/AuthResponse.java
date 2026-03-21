package com.frerememoire.webshop.infrastructure.api.auth;

public record AuthResponse(
        String token,
        String email,
        String role,
        String firstName,
        String lastName
) {
}
