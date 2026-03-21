package com.frerememoire.webshop.application.auth;

import com.frerememoire.webshop.domain.auth.AuthUser;
import com.frerememoire.webshop.domain.auth.PasswordEncoder;
import com.frerememoire.webshop.domain.auth.port.AuthUserRepository;
import com.frerememoire.webshop.domain.shared.BusinessRuleViolationException;
import com.frerememoire.webshop.domain.shared.EntityNotFoundException;

public class AuthenticationUseCase {

    private final AuthUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthenticationUseCase(AuthUserRepository userRepository,
                                  PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public AuthUser authenticate(String email, String rawPassword) {
        AuthUser user = userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("ユーザー", email));

        boolean success = user.authenticate(rawPassword, passwordEncoder);
        userRepository.save(user);

        if (!success) {
            throw new BusinessRuleViolationException("メールアドレスまたはパスワードが正しくありません");
        }
        return user;
    }
}
