package com.frerememoire.webshop.application.auth;

import com.frerememoire.webshop.domain.model.user.User;
import com.frerememoire.webshop.domain.repository.UserRepository;
import com.frerememoire.webshop.infrastructure.security.JwtTokenProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthUseCase {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthUseCase(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    public LoginResult login(LoginCommand command) {
        User user = userRepository.findByEmail(command.getEmail())
                .orElseThrow(() -> new RuntimeException(
                        "メールアドレスまたはパスワードが正しくありません"));

        if (user.isLocked()) {
            throw new RuntimeException("アカウントがロックされています");
        }

        if (!passwordEncoder.matches(
                command.getPassword(), user.getPasswordHash())) {
            user.incrementFailedLoginCount();
            userRepository.save(user);
            throw new RuntimeException(
                    "メールアドレスまたはパスワードが正しくありません");
        }

        user.resetFailedLoginCount();
        userRepository.save(user);

        String token = jwtTokenProvider.generateToken(
                user.getEmail(), user.getRole().name());

        return new LoginResult(
                token, user.getRole().name(), user.getName());
    }
}
