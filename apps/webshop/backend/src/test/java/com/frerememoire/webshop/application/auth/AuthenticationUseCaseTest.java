package com.frerememoire.webshop.application.auth;

import com.frerememoire.webshop.domain.auth.AuthUser;
import com.frerememoire.webshop.domain.auth.PasswordEncoder;
import com.frerememoire.webshop.domain.auth.Role;
import com.frerememoire.webshop.domain.auth.UserProfile;
import com.frerememoire.webshop.domain.auth.port.AuthUserRepository;
import com.frerememoire.webshop.domain.shared.BusinessRuleViolationException;
import com.frerememoire.webshop.domain.shared.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AuthenticationUseCaseTest {

    private AuthUserRepository userRepository;
    private PasswordEncoder passwordEncoder;
    private AuthenticationUseCase useCase;

    @BeforeEach
    void setUp() {
        userRepository = mock(AuthUserRepository.class);
        passwordEncoder = new PasswordEncoder() {
            @Override
            public String encode(String rawPassword) {
                return "encoded_" + rawPassword;
            }

            @Override
            public boolean matches(String rawPassword, String encodedPassword) {
                return encodedPassword.equals("encoded_" + rawPassword);
            }
        };
        useCase = new AuthenticationUseCase(userRepository, passwordEncoder);
    }

    @Test
    void 正しい認証情報でログインできる() {
        AuthUser user = AuthUser.create("test@example.com",
                passwordEncoder.encode("Password1"), Role.CUSTOMER,
                new UserProfile("山田", "太郎", null));
        when(userRepository.findByEmail("test@example.com"))
                .thenReturn(Optional.of(user));
        when(userRepository.save(any())).thenReturn(user);

        AuthUser result = useCase.authenticate("test@example.com", "Password1");

        assertThat(result.getEmail()).isEqualTo("test@example.com");
        verify(userRepository).save(any());
    }

    @Test
    void 存在しないメールアドレスで例外が発生する() {
        when(userRepository.findByEmail("unknown@example.com"))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                useCase.authenticate("unknown@example.com", "Password1"))
                .isInstanceOf(EntityNotFoundException.class);
    }

    @Test
    void 誤ったパスワードで例外が発生する() {
        AuthUser user = AuthUser.create("test@example.com",
                passwordEncoder.encode("Password1"), Role.CUSTOMER,
                new UserProfile("山田", "太郎", null));
        when(userRepository.findByEmail("test@example.com"))
                .thenReturn(Optional.of(user));
        when(userRepository.save(any())).thenReturn(user);

        assertThatThrownBy(() ->
                useCase.authenticate("test@example.com", "WrongPass1"))
                .isInstanceOf(BusinessRuleViolationException.class)
                .hasMessageContaining("正しくありません");
    }
}
