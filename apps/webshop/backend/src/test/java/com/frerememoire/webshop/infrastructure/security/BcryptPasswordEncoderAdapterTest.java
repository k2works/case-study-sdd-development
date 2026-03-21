package com.frerememoire.webshop.infrastructure.security;

import com.frerememoire.webshop.domain.auth.PasswordEncoder;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class BcryptPasswordEncoderAdapterTest {

    private PasswordEncoder encoder;

    @BeforeEach
    void setUp() {
        encoder = new BcryptPasswordEncoderAdapter(
                new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder());
    }

    @Test
    void パスワードをエンコードできる() {
        String encoded = encoder.encode("Password1");

        assertThat(encoded).isNotNull();
        assertThat(encoded).isNotEqualTo("Password1");
    }

    @Test
    void 正しいパスワードがマッチする() {
        String encoded = encoder.encode("Password1");

        assertThat(encoder.matches("Password1", encoded)).isTrue();
    }

    @Test
    void 誤ったパスワードはマッチしない() {
        String encoded = encoder.encode("Password1");

        assertThat(encoder.matches("WrongPass", encoded)).isFalse();
    }
}
