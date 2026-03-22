package com.frerememoire.webshop.domain.stock;

import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

class DailyInventoryTest {

    @Test
    void projectedStockが正しく計算される() {
        DailyInventory daily = new DailyInventory(
                LocalDate.of(2026, 5, 1), 100, 20, 10, 5);

        // 100 + 20 - 10 - 5 = 105
        assertThat(daily.getProjectedStock()).isEqualTo(105);
    }

    @Test
    void 全てゼロの場合projectedStockもゼロ() {
        DailyInventory daily = new DailyInventory(
                LocalDate.of(2026, 5, 1), 0, 0, 0, 0);

        assertThat(daily.getProjectedStock()).isEqualTo(0);
    }

    @Test
    void マイナス在庫になる場合もそのまま計算する() {
        DailyInventory daily = new DailyInventory(
                LocalDate.of(2026, 5, 1), 5, 0, 10, 0);

        // 5 + 0 - 10 - 0 = -5
        assertThat(daily.getProjectedStock()).isEqualTo(-5);
    }
}
