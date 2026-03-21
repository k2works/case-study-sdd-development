package com.frerememoire.webshop.application.auth;

import com.frerememoire.webshop.domain.auth.AuthUser;
import com.frerememoire.webshop.domain.auth.PasswordEncoder;
import com.frerememoire.webshop.domain.auth.Role;
import com.frerememoire.webshop.domain.auth.port.AuthUserRepository;
import com.frerememoire.webshop.domain.customer.port.CustomerRepository;
import com.frerememoire.webshop.domain.shared.BusinessRuleViolationException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class RegistrationUseCaseTest {

    private AuthUserRepository userRepository;
    private CustomerRepository customerRepository;
    private PasswordEncoder passwordEncoder;
    private RegistrationUseCase useCase;

    @BeforeEach
    void setUp() {
        userRepository = mock(AuthUserRepository.class);
        customerRepository = mock(CustomerRepository.class);
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
        useCase = new RegistrationUseCase(userRepository, customerRepository, passwordEncoder);
    }

    @Test
    void 正常にアカウント登録できる() {
        when(userRepository.existsByEmail("new@example.com")).thenReturn(false);
        when(userRepository.save(any())).thenAnswer(invocation -> {
            AuthUser user = invocation.getArgument(0);
            user.setId(1L);
            return user;
        });

        AuthUser result = useCase.register("new@example.com", "Password1",
                "太郎", "山田", "090-1234-5678");

        assertThat(result.getEmail()).isEqualTo("new@example.com");
        assertThat(result.getRole()).isEqualTo(Role.CUSTOMER);
        assertThat(result.getProfile().getFirstName()).isEqualTo("太郎");
        assertThat(result.getProfile().getLastName()).isEqualTo("山田");
        verify(customerRepository).save(argThat(customer ->
                customer.getUserId().equals(1L)
                        && customer.getName().equals("山田 太郎")
                        && customer.getPhone().equals("090-1234-5678")));
    }

    @Test
    void 登録済みメールアドレスで例外が発生する() {
        when(userRepository.existsByEmail("existing@example.com")).thenReturn(true);

        assertThatThrownBy(() ->
                useCase.register("existing@example.com", "Password1",
                        "太郎", "山田", null))
                .isInstanceOf(BusinessRuleViolationException.class)
                .hasMessageContaining("既に登録");
    }

    @Test
    void パスワードポリシー違反で例外が発生する() {
        assertThatThrownBy(() ->
                useCase.register("new@example.com", "short",
                        "太郎", "山田", null))
                .isInstanceOf(BusinessRuleViolationException.class)
                .hasMessageContaining("8文字以上");
    }
}
