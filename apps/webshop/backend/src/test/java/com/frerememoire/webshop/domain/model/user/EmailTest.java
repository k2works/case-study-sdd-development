package com.frerememoire.webshop.domain.model.user;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class EmailTest {

    @Test
    void shouldCreateEmailWithValidAddress() {
        // Given: 有効なメールアドレス文字列
        String validAddress = "user@example.com";

        // When: Email を生成する
        Email email = new Email(validAddress);

        // Then: メールアドレスが正しく保持される
        assertEquals(validAddress, email.getValue());
    }

    @Test
    void shouldRejectNullAddress() {
        // Given: null のメールアドレス

        // When/Then: Email 生成時に例外がスローされる
        assertThrows(IllegalArgumentException.class, () -> new Email(null));
    }

    @Test
    void shouldRejectEmptyAddress() {
        // Given: 空文字のメールアドレス

        // When/Then: Email 生成時に例外がスローされる
        assertThrows(IllegalArgumentException.class, () -> new Email(""));
    }

    @Test
    void shouldRejectBlankAddress() {
        // Given: 空白のみのメールアドレス

        // When/Then: Email 生成時に例外がスローされる
        assertThrows(IllegalArgumentException.class, () -> new Email("   "));
    }

    @Test
    void shouldRejectAddressWithoutAtSign() {
        // Given: @ がないメールアドレス

        // When/Then: Email 生成時に例外がスローされる
        assertThrows(IllegalArgumentException.class, () -> new Email("userexample.com"));
    }

    @Test
    void shouldRejectAddressWithoutDomain() {
        // Given: ドメインがないメールアドレス

        // When/Then: Email 生成時に例外がスローされる
        assertThrows(IllegalArgumentException.class, () -> new Email("user@"));
    }

    @Test
    void shouldRejectAddressWithoutLocalPart() {
        // Given: ローカルパートがないメールアドレス

        // When/Then: Email 生成時に例外がスローされる
        assertThrows(IllegalArgumentException.class, () -> new Email("@example.com"));
    }

    @Test
    void shouldBeEqualWhenSameAddress() {
        // Given: 同じメールアドレスの 2 つの Email
        Email email1 = new Email("user@example.com");
        Email email2 = new Email("user@example.com");

        // When/Then: 等価である
        assertEquals(email1, email2);
        assertEquals(email1.hashCode(), email2.hashCode());
    }

    @Test
    void shouldNotBeEqualWhenDifferentAddress() {
        // Given: 異なるメールアドレスの 2 つの Email
        Email email1 = new Email("user1@example.com");
        Email email2 = new Email("user2@example.com");

        // When/Then: 等価でない
        assertNotEquals(email1, email2);
    }
}
