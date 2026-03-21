package com.frerememoire.webshop.domain.auth;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class RoleTest {

    @Test
    void 全てのロールが定義されている() {
        assertThat(Role.values()).containsExactly(
                Role.OWNER,
                Role.ORDER_STAFF,
                Role.PURCHASE_STAFF,
                Role.FLORIST,
                Role.DELIVERY_STAFF,
                Role.CUSTOMER
        );
    }
}
