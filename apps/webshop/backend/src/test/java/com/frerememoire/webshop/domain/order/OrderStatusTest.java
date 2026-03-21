package com.frerememoire.webshop.domain.order;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class OrderStatusTest {

    @Test
    void 注文受付から受付済みに遷移できる() {
        OrderStatus status = OrderStatus.ORDERED;

        assertThat(status.canTransitionTo(OrderStatus.ACCEPTED)).isTrue();
    }

    @Test
    void 注文受付からキャンセルに遷移できる() {
        OrderStatus status = OrderStatus.ORDERED;

        assertThat(status.canTransitionTo(OrderStatus.CANCELLED)).isTrue();
    }

    @Test
    void 受付済みから出荷準備中に遷移できる() {
        assertThat(OrderStatus.ACCEPTED.canTransitionTo(OrderStatus.PREPARING)).isTrue();
    }

    @Test
    void 出荷準備中から出荷済みに遷移できる() {
        assertThat(OrderStatus.PREPARING.canTransitionTo(OrderStatus.SHIPPED)).isTrue();
    }

    @Test
    void 出荷済みから届け完了に遷移できる() {
        assertThat(OrderStatus.SHIPPED.canTransitionTo(OrderStatus.DELIVERED)).isTrue();
    }

    @Test
    void 注文受付から出荷準備中には遷移できない() {
        assertThat(OrderStatus.ORDERED.canTransitionTo(OrderStatus.PREPARING)).isFalse();
    }

    @Test
    void 届け完了から他のステータスには遷移できない() {
        for (OrderStatus target : OrderStatus.values()) {
            if (target != OrderStatus.DELIVERED) {
                assertThat(OrderStatus.DELIVERED.canTransitionTo(target)).isFalse();
            }
        }
    }

    @Test
    void キャンセルから他のステータスには遷移できない() {
        for (OrderStatus target : OrderStatus.values()) {
            if (target != OrderStatus.CANCELLED) {
                assertThat(OrderStatus.CANCELLED.canTransitionTo(target)).isFalse();
            }
        }
    }

    @Test
    void transitionToで正常に遷移できる() {
        OrderStatus next = OrderStatus.ORDERED.transitionTo(OrderStatus.ACCEPTED);

        assertThat(next).isEqualTo(OrderStatus.ACCEPTED);
    }

    @Test
    void transitionToで不正な遷移はIllegalStateExceptionが発生する() {
        assertThatThrownBy(() -> OrderStatus.ORDERED.transitionTo(OrderStatus.SHIPPED))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("ORDERED")
                .hasMessageContaining("SHIPPED");
    }

    @Test
    void 全6状態が定義されている() {
        assertThat(OrderStatus.values()).hasSize(6);
    }
}
