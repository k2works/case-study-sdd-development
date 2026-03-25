package com.frerememoire.webshop.infrastructure.web;

import com.frerememoire.webshop.application.auth.AuthUseCase;
import com.frerememoire.webshop.application.auth.LoginCommand;
import com.frerememoire.webshop.application.auth.LoginResult;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthUseCase authUseCase;

    public AuthController(AuthUseCase authUseCase) {
        this.authUseCase = authUseCase;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResult> login(
            @RequestBody LoginCommand command) {
        LoginResult result = authUseCase.login(command);
        return ResponseEntity.ok(result);
    }
}
