package com.frerememoire.webshop.infrastructure.api.auth;

import com.frerememoire.webshop.application.auth.AuthenticationUseCase;
import com.frerememoire.webshop.application.auth.RegistrationUseCase;
import com.frerememoire.webshop.domain.auth.AuthUser;
import com.frerememoire.webshop.infrastructure.security.JwtTokenProvider;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthenticationUseCase authenticationUseCase;
    private final RegistrationUseCase registrationUseCase;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthController(AuthenticationUseCase authenticationUseCase,
                          RegistrationUseCase registrationUseCase,
                          JwtTokenProvider jwtTokenProvider) {
        this.authenticationUseCase = authenticationUseCase;
        this.registrationUseCase = registrationUseCase;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthUser user = authenticationUseCase.authenticate(
                request.email(), request.password());

        String token = jwtTokenProvider.generateToken(
                user.getEmail(), user.getRole().name());

        return ResponseEntity.ok(toResponse(token, user));
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthUser user = registrationUseCase.register(
                request.email(), request.password(),
                request.firstName(), request.lastName(), request.phone());

        String token = jwtTokenProvider.generateToken(
                user.getEmail(), user.getRole().name());

        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(token, user));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        return ResponseEntity.ok().build();
    }

    private AuthResponse toResponse(String token, AuthUser user) {
        return new AuthResponse(
                token,
                user.getEmail(),
                user.getRole().name(),
                user.getProfile().getFirstName(),
                user.getProfile().getLastName());
    }
}
