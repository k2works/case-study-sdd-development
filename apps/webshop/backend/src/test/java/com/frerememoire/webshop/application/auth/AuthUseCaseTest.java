package com.frerememoire.webshop.application.auth;

import com.frerememoire.webshop.domain.model.user.Role;
import com.frerememoire.webshop.domain.model.user.User;
import com.frerememoire.webshop.domain.repository.UserRepository;
import com.frerememoire.webshop.infrastructure.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthUseCaseTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    private AuthUseCase authUseCase;

    @BeforeEach
    void setUp() {
        authUseCase = new AuthUseCase(userRepository, passwordEncoder, jwtTokenProvider);
    }

    private User createUser(String email, String passwordHash, Role role) {
        return new User("テストユーザー", email, passwordHash, role);
    }

    @Test
    void shouldReturnTokenWhenCredentialsAreValid() {
        // Given: 有効なユーザーが存在する
        String email = "customer@example.com";
        String rawPassword = "password123";
        String passwordHash = "hashedPassword";
        String expectedToken = "jwt-token-123";
        User user = createUser(email, passwordHash, Role.CUSTOMER);

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(rawPassword, passwordHash)).thenReturn(true);
        when(jwtTokenProvider.generateToken(email, Role.CUSTOMER.name())).thenReturn(expectedToken);

        // When: ログインを実行する
        LoginCommand command = new LoginCommand(email, rawPassword);
        LoginResult result = authUseCase.login(command);

        // Then: JWT トークンとユーザー情報が返る
        assertNotNull(result);
        assertEquals(expectedToken, result.getToken());
        assertEquals(Role.CUSTOMER.name(), result.getRole());
        assertEquals("テストユーザー", result.getName());
    }

    @Test
    void shouldResetFailedLoginCountOnSuccessfulLogin() {
        // Given: 失敗カウントが 2 のユーザー
        String email = "customer@example.com";
        User user = createUser(email, "hashedPassword", Role.CUSTOMER);
        user.incrementFailedLoginCount();
        user.incrementFailedLoginCount();

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password123", "hashedPassword")).thenReturn(true);
        when(jwtTokenProvider.generateToken(email, Role.CUSTOMER.name())).thenReturn("token");

        // When: ログインに成功する
        LoginCommand command = new LoginCommand(email, "password123");
        authUseCase.login(command);

        // Then: 失敗カウントがリセットされ、ユーザーが保存される
        assertEquals(0, user.getFailedLoginCount());
        verify(userRepository).save(user);
    }

    @Test
    void shouldThrowExceptionWhenUserNotFound() {
        // Given: 存在しないメールアドレス
        String email = "unknown@example.com";
        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());

        // When/Then: 認証失敗の例外がスローされる
        LoginCommand command = new LoginCommand(email, "password123");
        RuntimeException exception = assertThrows(RuntimeException.class, () -> authUseCase.login(command));
        assertEquals("メールアドレスまたはパスワードが正しくありません", exception.getMessage());
    }

    @Test
    void shouldThrowExceptionWhenPasswordIsInvalid() {
        // Given: パスワードが一致しないユーザー
        String email = "customer@example.com";
        User user = createUser(email, "hashedPassword", Role.CUSTOMER);

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrongPassword", "hashedPassword")).thenReturn(false);

        // When/Then: 認証失敗の例外がスローされる
        LoginCommand command = new LoginCommand(email, "wrongPassword");
        RuntimeException exception = assertThrows(RuntimeException.class, () -> authUseCase.login(command));
        assertEquals("メールアドレスまたはパスワードが正しくありません", exception.getMessage());
    }

    @Test
    void shouldIncrementFailedLoginCountOnInvalidPassword() {
        // Given: 有効なユーザー
        String email = "customer@example.com";
        User user = createUser(email, "hashedPassword", Role.CUSTOMER);

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrongPassword", "hashedPassword")).thenReturn(false);

        // When: 無効なパスワードでログインを試みる
        LoginCommand command = new LoginCommand(email, "wrongPassword");
        assertThrows(RuntimeException.class, () -> authUseCase.login(command));

        // Then: 失敗カウントがインクリメントされ、ユーザーが保存される
        assertEquals(1, user.getFailedLoginCount());
        verify(userRepository).save(user);
    }

    @Test
    void shouldThrowExceptionWhenAccountIsLocked() {
        // Given: アカウントがロックされたユーザー（5 回失敗）
        String email = "locked@example.com";
        User user = createUser(email, "hashedPassword", Role.CUSTOMER);
        for (int i = 0; i < 5; i++) {
            user.incrementFailedLoginCount();
        }

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));

        // When/Then: アカウントロックの例外がスローされる
        LoginCommand command = new LoginCommand(email, "password123");
        RuntimeException exception = assertThrows(RuntimeException.class, () -> authUseCase.login(command));
        assertEquals("アカウントがロックされています", exception.getMessage());
    }

    @Test
    void shouldNotVerifyPasswordWhenAccountIsLocked() {
        // Given: アカウントがロックされたユーザー
        String email = "locked@example.com";
        User user = createUser(email, "hashedPassword", Role.CUSTOMER);
        for (int i = 0; i < 5; i++) {
            user.incrementFailedLoginCount();
        }

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));

        // When: ロック済みアカウントでログインを試みる
        LoginCommand command = new LoginCommand(email, "password123");
        assertThrows(RuntimeException.class, () -> authUseCase.login(command));

        // Then: パスワード検証が実行されない
        verify(passwordEncoder, never()).matches(any(), any());
    }

    @Test
    void shouldLockAccountAfterFifthFailedAttempt() {
        // Given: 失敗カウント 4 のユーザー
        String email = "customer@example.com";
        User user = createUser(email, "hashedPassword", Role.CUSTOMER);
        for (int i = 0; i < 4; i++) {
            user.incrementFailedLoginCount();
        }

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrongPassword", "hashedPassword")).thenReturn(false);

        // When: 5 回目の失敗
        LoginCommand command = new LoginCommand(email, "wrongPassword");
        assertThrows(RuntimeException.class, () -> authUseCase.login(command));

        // Then: アカウントがロックされる
        assertEquals(5, user.getFailedLoginCount());
        assertTrue(user.isLocked());
        verify(userRepository).save(user);
    }

    @Test
    void shouldReturnCorrectRoleForStaffUser() {
        // Given: スタッフユーザーが存在する
        String email = "staff@example.com";
        User user = createUser(email, "hashedPassword", Role.ORDER_STAFF);

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password123", "hashedPassword")).thenReturn(true);
        when(jwtTokenProvider.generateToken(email, Role.ORDER_STAFF.name())).thenReturn("token");

        // When: ログインに成功する
        LoginCommand command = new LoginCommand(email, "password123");
        LoginResult result = authUseCase.login(command);

        // Then: スタッフロールが返る
        assertEquals(Role.ORDER_STAFF.name(), result.getRole());
    }

    private void assertTrue(boolean condition) {
        org.junit.jupiter.api.Assertions.assertTrue(condition);
    }
}
