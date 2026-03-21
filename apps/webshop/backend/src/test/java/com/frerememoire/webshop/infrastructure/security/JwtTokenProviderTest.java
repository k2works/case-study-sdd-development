package com.frerememoire.webshop.infrastructure.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtTokenProviderTest {

    private JwtTokenProvider tokenProvider;

    @BeforeEach
    void setUp() {
        String secret = "dGhpcyBpcyBhIHZlcnkgbG9uZyBzZWNyZXQga2V5IGZvciB0ZXN0aW5nIHB1cnBvc2VzIG9ubHk=";
        tokenProvider = new JwtTokenProvider(secret, 3600000L);
    }

    @Test
    void トークンを生成できる() {
        String token = tokenProvider.generateToken("test@example.com", "CUSTOMER");

        assertThat(token).isNotNull();
        assertThat(token).isNotBlank();
    }

    @Test
    void トークンからメールアドレスを取得できる() {
        String token = tokenProvider.generateToken("test@example.com", "CUSTOMER");

        String email = tokenProvider.getEmailFromToken(token);

        assertThat(email).isEqualTo("test@example.com");
    }

    @Test
    void トークンからロールを取得できる() {
        String token = tokenProvider.generateToken("test@example.com", "CUSTOMER");

        String role = tokenProvider.getRoleFromToken(token);

        assertThat(role).isEqualTo("CUSTOMER");
    }

    @Test
    void 有効なトークンを検証できる() {
        String token = tokenProvider.generateToken("test@example.com", "CUSTOMER");

        assertThat(tokenProvider.validateToken(token)).isTrue();
    }

    @Test
    void 不正なトークンは検証に失敗する() {
        assertThat(tokenProvider.validateToken("invalid.token.here")).isFalse();
    }

    @Test
    void 期限切れトークンは検証に失敗する() {
        JwtTokenProvider shortLived = new JwtTokenProvider(
                "dGhpcyBpcyBhIHZlcnkgbG9uZyBzZWNyZXQga2V5IGZvciB0ZXN0aW5nIHB1cnBvc2VzIG9ubHk=",
                0L);
        String token = shortLived.generateToken("test@example.com", "CUSTOMER");

        assertThat(shortLived.validateToken(token)).isFalse();
    }
}
