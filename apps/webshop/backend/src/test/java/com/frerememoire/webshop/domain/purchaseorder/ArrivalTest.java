package com.frerememoire.webshop.domain.purchaseorder;

import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ArrivalTest {

    @Test
    void 正常に入荷を作成できる() {
        LocalDateTime arrivedAt = LocalDateTime.of(2026, 4, 1, 10, 0);
        Arrival arrival = Arrival.create(1L, 2L, 10, arrivedAt);

        assertThat(arrival.getId()).isNull();
        assertThat(arrival.getPurchaseOrderId()).isEqualTo(1L);
        assertThat(arrival.getItemId()).isEqualTo(2L);
        assertThat(arrival.getQuantity()).isEqualTo(10);
        assertThat(arrival.getArrivedAt()).isEqualTo(arrivedAt);
    }

    @Test
    void 発注IDがnullの場合は例外() {
        assertThatThrownBy(() ->
                Arrival.create(null, 2L, 10, LocalDateTime.now()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("発注ID");
    }

    @Test
    void 単品IDがnullの場合は例外() {
        assertThatThrownBy(() ->
                Arrival.create(1L, null, 10, LocalDateTime.now()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("単品ID");
    }

    @Test
    void 数量が0以下の場合は例外() {
        assertThatThrownBy(() ->
                Arrival.create(1L, 2L, 0, LocalDateTime.now()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("数量");
    }

    @Test
    void 入荷日時がnullの場合は例外() {
        assertThatThrownBy(() ->
                Arrival.create(1L, 2L, 10, null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("入荷日時");
    }
}
