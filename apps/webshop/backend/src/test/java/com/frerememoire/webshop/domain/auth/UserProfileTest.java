package com.frerememoire.webshop.domain.auth;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class UserProfileTest {

    @Test
    void 正常にプロフィールを作成できる() {
        UserProfile profile = new UserProfile("太郎", "山田", "090-1234-5678");

        assertThat(profile.getFirstName()).isEqualTo("太郎");
        assertThat(profile.getLastName()).isEqualTo("山田");
        assertThat(profile.getPhone()).isEqualTo("090-1234-5678");
    }

    @Test
    void 電話番号はnullでも作成できる() {
        UserProfile profile = new UserProfile("太郎", "山田", null);

        assertThat(profile.getPhone()).isNull();
    }

    @Test
    void 名が空の場合は例外が発生する() {
        assertThatThrownBy(() -> new UserProfile("", "山田", null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("名は必須");
    }

    @Test
    void 姓が空の場合は例外が発生する() {
        assertThatThrownBy(() -> new UserProfile("太郎", "", null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("姓は必須");
    }

    @Test
    void 名がnullの場合は例外が発生する() {
        assertThatThrownBy(() -> new UserProfile(null, "山田", null))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
