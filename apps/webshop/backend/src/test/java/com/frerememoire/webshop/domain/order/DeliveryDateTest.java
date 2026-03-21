package com.frerememoire.webshop.domain.order;

import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class DeliveryDateTest {

    @Test
    void 翌日の届け日を作成できる() {
        LocalDate tomorrow = LocalDate.now().plusDays(1);

        DeliveryDate deliveryDate = new DeliveryDate(tomorrow);

        assertThat(deliveryDate.getValue()).isEqualTo(tomorrow);
    }

    @Test
    void 三十日後の届け日を作成できる() {
        LocalDate thirtyDaysLater = LocalDate.now().plusDays(30);

        DeliveryDate deliveryDate = new DeliveryDate(thirtyDaysLater);

        assertThat(deliveryDate.getValue()).isEqualTo(thirtyDaysLater);
    }

    @Test
    void 当日の届け日は作成できない() {
        LocalDate today = LocalDate.now();

        assertThatThrownBy(() -> new DeliveryDate(today))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("翌日");
    }

    @Test
    void 三十一日後の届け日は作成できない() {
        LocalDate thirtyOneDaysLater = LocalDate.now().plusDays(31);

        assertThatThrownBy(() -> new DeliveryDate(thirtyOneDaysLater))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("30日後");
    }

    @Test
    void 過去日の届け日は作成できない() {
        LocalDate yesterday = LocalDate.now().minusDays(1);

        assertThatThrownBy(() -> new DeliveryDate(yesterday))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("翌日");
    }

    @Test
    void nullの届け日は作成できない() {
        assertThatThrownBy(() -> new DeliveryDate(null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("届け日は必須");
    }

    @Test
    void 同じ日付のDeliveryDateは等しい() {
        LocalDate date = LocalDate.now().plusDays(5);

        DeliveryDate d1 = new DeliveryDate(date);
        DeliveryDate d2 = new DeliveryDate(date);

        assertThat(d1).isEqualTo(d2);
        assertThat(d1.hashCode()).isEqualTo(d2.hashCode());
    }
}
