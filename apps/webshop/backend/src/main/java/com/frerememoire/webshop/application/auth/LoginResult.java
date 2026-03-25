package com.frerememoire.webshop.application.auth;

public class LoginResult {

    private final String token;
    private final String role;
    private final String name;

    public LoginResult(String token, String role, String name) {
        this.token = token;
        this.role = role;
        this.name = name;
    }

    public String getToken() {
        return token;
    }

    public String getRole() {
        return role;
    }

    public String getName() {
        return name;
    }
}
