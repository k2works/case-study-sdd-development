package com.frerememoire.webshop.domain.order;

import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class OrderTest {

    private static final Long CUSTOMER_ID = 1L;
    private static final Long PRODUCT_ID = 1L;
    private static final Long DELIVERY_DEST_ID = 1L;
    private static final LocalDate VALID_DATE = LocalDate.now().plusDays(5);

    @Test
    void 正常に注文を作成できる() {
        Order order = Order.create(CUSTOMER_ID, PRODUCT_ID, DELIVERY_DEST_ID,
                VALID_DATE, "お誕生日おめでとう");

        assertThat(order.getCustomerId()).isEqualTo(CUSTOMER_ID);
        assertThat(order.getProductId()).isEqualTo(PRODUCT_ID);
        assertThat(order.getDeliveryDestinationId()).isEqualTo(DELIVERY_DEST_ID);
        assertThat(order.getDeliveryDateValue()).isEqualTo(VALID_DATE);
        assertThat(order.getMessageValue()).isEqualTo("お誕生日おめでとう");
        assertThat(order.getStatus()).isEqualTo(OrderStatus.ORDERED);
        assertThat(order.getOrderedAt()).isNotNull();
    }

    @Test
    void メッセージなしで注文を作成できる() {
        Order order = Order.create(CUSTOMER_ID, PRODUCT_ID, DELIVERY_DEST_ID,
                VALID_DATE, null);

        assertThat(order.getMessageValue()).isNull();
    }

    @Test
    void 得意先IDがnullの場合は例外が発生する() {
        assertThatThrownBy(() -> Order.create(null, PRODUCT_ID, DELIVERY_DEST_ID,
                VALID_DATE, null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("得意先ID");
    }

    @Test
    void 商品IDがnullの場合は例外が発生する() {
        assertThatThrownBy(() -> Order.create(CUSTOMER_ID, null, DELIVERY_DEST_ID,
                VALID_DATE, null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("商品ID");
    }

    @Test
    void 届け先IDがnullの場合は例外が発生する() {
        assertThatThrownBy(() -> Order.create(CUSTOMER_ID, PRODUCT_ID, null,
                VALID_DATE, null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("届け先ID");
    }

    @Test
    void 注文を受付済みに更新できる() {
        Order order = Order.create(CUSTOMER_ID, PRODUCT_ID, DELIVERY_DEST_ID,
                VALID_DATE, null);

        order.accept();

        assertThat(order.getStatus()).isEqualTo(OrderStatus.ACCEPTED);
    }

    @Test
    void 受付済みの注文を再度受付済みにはできない() {
        Order order = Order.create(CUSTOMER_ID, PRODUCT_ID, DELIVERY_DEST_ID,
                VALID_DATE, null);
        order.accept();

        assertThatThrownBy(order::accept)
                .isInstanceOf(IllegalStateException.class);
    }
}
