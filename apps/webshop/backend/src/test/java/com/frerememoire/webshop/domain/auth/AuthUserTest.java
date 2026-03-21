package com.frerememoire.webshop.domain.auth;

import com.frerememoire.webshop.domain.shared.BusinessRuleViolationException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class AuthUserTest {

    private PasswordEncoder encoder;
    private UserProfile profile;

    @BeforeEach
    void setUp() {
        encoder = new PasswordEncoder() {
            @Override
            public String encode(String rawPassword) {
                return "encoded_" + rawPassword;
            }

            @Override
            public boolean matches(String rawPassword, String encodedPassword) {
                return encodedPassword.equals("encoded_" + rawPassword);
            }
        };
        profile = new UserProfile("山田", "太郎", "090-1234-5678");
    }

    @Test
    void 正常にユーザーを作成できる() {
        AuthUser user = AuthUser.create("test@example.com",
                encoder.encode("Password1"), Role.CUSTOMER, profile);

        assertThat(user.getEmail()).isEqualTo("test@example.com");
        assertThat(user.getRole()).isEqualTo(Role.CUSTOMER);
        assertThat(user.getFailedLoginCount()).isZero();
        assertThat(user.isLocked()).isFalse();
    }

    @Test
    void 認証成功で失敗カウントがリセットされる() {
        AuthUser user = AuthUser.create("test@example.com",
                encoder.encode("Password1"), Role.CUSTOMER, profile);

        boolean result = user.authenticate("Password1", encoder);

        assertThat(result).isTrue();
        assertThat(user.getFailedLoginCount()).isZero();
    }

    @Test
    void 認証失敗で失敗カウントが増加する() {
        AuthUser user = AuthUser.create("test@example.com",
                encoder.encode("Password1"), Role.CUSTOMER, profile);

        boolean result = user.authenticate("WrongPass1", encoder);

        assertThat(result).isFalse();
        assertThat(user.getFailedLoginCount()).isEqualTo(1);
    }

    @Test
    void 連続5回失敗でアカウントがロックされる() {
        AuthUser user = AuthUser.create("test@example.com",
                encoder.encode("Password1"), Role.CUSTOMER, profile);

        for (int i = 0; i < 5; i++) {
            user.authenticate("WrongPass1", encoder);
        }

        assertThat(user.getFailedLoginCount()).isEqualTo(5);
        assertThat(user.isLocked()).isTrue();
    }

    @Test
    void ロック中は正しいパスワードでも認証不可() {
        AuthUser user = AuthUser.create("test@example.com",
                encoder.encode("Password1"), Role.CUSTOMER, profile);

        for (int i = 0; i < 5; i++) {
            user.authenticate("WrongPass1", encoder);
        }

        assertThatThrownBy(() -> user.authenticate("Password1", encoder))
                .isInstanceOf(BusinessRuleViolationException.class)
                .hasMessageContaining("ロック");
    }

    @Test
    void ロック期限切れで認証可能になる() {
        AuthUser user = new AuthUser(1L, "test@example.com",
                encoder.encode("Password1"), Role.CUSTOMER, profile,
                5, LocalDateTime.now().minusMinutes(1),
                LocalDateTime.now(), LocalDateTime.now());

        assertThat(user.isLocked()).isFalse();

        boolean result = user.authenticate("Password1", encoder);
        assertThat(result).isTrue();
        assertThat(user.getFailedLoginCount()).isZero();
    }

    @Test
    void メールアドレスが空の場合は例外が発生する() {
        assertThatThrownBy(() -> AuthUser.create("", "hash", Role.CUSTOMER, profile))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
