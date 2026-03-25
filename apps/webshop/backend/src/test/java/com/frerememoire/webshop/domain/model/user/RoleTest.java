package com.frerememoire.webshop.domain.model.user;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class RoleTest {

    @Test
    void shouldHaveCustomerRole() {
        // Given/When: CUSTOMER ロールを取得する
        Role role = Role.CUSTOMER;

        // Then: ロール名が正しい
        assertEquals("CUSTOMER", role.name());
    }

    @Test
    void shouldHaveOrderStaffRole() {
        // Given/When: ORDER_STAFF ロールを取得する
        Role role = Role.ORDER_STAFF;

        // Then: ロール名が正しい
        assertEquals("ORDER_STAFF", role.name());
    }

    @Test
    void shouldHavePurchaseStaffRole() {
        // Given/When: PURCHASE_STAFF ロールを取得する
        Role role = Role.PURCHASE_STAFF;

        // Then: ロール名が正しい
        assertEquals("PURCHASE_STAFF", role.name());
    }

    @Test
    void shouldHaveFloristRole() {
        // Given/When: FLORIST ロールを取得する
        Role role = Role.FLORIST;

        // Then: ロール名が正しい
        assertEquals("FLORIST", role.name());
    }

    @Test
    void shouldHaveDeliveryStaffRole() {
        // Given/When: DELIVERY_STAFF ロールを取得する
        Role role = Role.DELIVERY_STAFF;

        // Then: ロール名が正しい
        assertEquals("DELIVERY_STAFF", role.name());
    }

    @Test
    void shouldHaveOwnerRole() {
        // Given/When: OWNER ロールを取得する
        Role role = Role.OWNER;

        // Then: ロール名が正しい
        assertEquals("OWNER", role.name());
    }

    @Test
    void shouldHaveSixRoles() {
        // Given/When: 全ロールを取得する

        // Then: 6 種類のロールが定義されている
        assertEquals(6, Role.values().length);
    }
}
