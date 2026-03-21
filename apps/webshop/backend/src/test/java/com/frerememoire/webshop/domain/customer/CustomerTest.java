package com.frerememoire.webshop.domain.customer;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class CustomerTest {

    @Test
    void 正常に得意先を作成できる() {
        Customer customer = Customer.create(1L, "山田太郎", "090-1234-5678");

        assertThat(customer.getUserId()).isEqualTo(1L);
        assertThat(customer.getName()).isEqualTo("山田太郎");
        assertThat(customer.getPhone()).isEqualTo("090-1234-5678");
        assertThat(customer.getCreatedAt()).isNotNull();
    }

    @Test
    void 電話番号なしで得意先を作成できる() {
        Customer customer = Customer.create(1L, "山田太郎", null);

        assertThat(customer.getPhone()).isNull();
    }

    @Test
    void ユーザーIDがnullの場合は例外が発生する() {
        assertThatThrownBy(() -> Customer.create(null, "山田太郎", null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("ユーザーID");
    }

    @Test
    void 得意先名が空の場合は例外が発生する() {
        assertThatThrownBy(() -> Customer.create(1L, "", null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("得意先名");
    }

    @Test
    void 得意先名がnullの場合は例外が発生する() {
        assertThatThrownBy(() -> Customer.create(1L, null, null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("得意先名");
    }
}
