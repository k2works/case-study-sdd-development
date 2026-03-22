package com.frerememoire.webshop.domain.stock;

import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class StockTest {

    @Test
    void 在庫を作成するとexpiryDateが自動計算される() {
        LocalDate arrivedDate = LocalDate.of(2026, 5, 1);
        Stock stock = Stock.create(1L, 10, arrivedDate, 7);

        assertThat(stock.getItemId()).isEqualTo(1L);
        assertThat(stock.getQuantity()).isEqualTo(10);
        assertThat(stock.getArrivedDate()).isEqualTo(arrivedDate);
        assertThat(stock.getExpiryDate()).isEqualTo(LocalDate.of(2026, 5, 8));
        assertThat(stock.getStatus()).isEqualTo(StockStatus.AVAILABLE);
    }

    @Test
    void 品質保持日数1日の場合は当日が期限() {
        LocalDate arrivedDate = LocalDate.of(2026, 5, 1);
        Stock stock = Stock.create(1L, 5, arrivedDate, 1);

        assertThat(stock.getExpiryDate()).isEqualTo(LocalDate.of(2026, 5, 2));
    }

    @Test
    void 数量0以下で作成すると例外() {
        assertThatThrownBy(() -> Stock.create(1L, 0, LocalDate.now(), 7))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("数量");
    }

    @Test
    void arrivedDateがnullで作成すると例外() {
        assertThatThrownBy(() -> Stock.create(1L, 10, null, 7))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("入荷日");
    }

    @Test
    void 品質保持日数0以下で作成すると例外() {
        assertThatThrownBy(() -> Stock.create(1L, 10, LocalDate.now(), 0))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("品質保持日数");
    }

    @Test
    void consumeで数量が減少する() {
        Stock stock = Stock.create(1L, 10, LocalDate.of(2026, 5, 1), 7);

        stock.consume(3);

        assertThat(stock.getQuantity()).isEqualTo(7);
    }

    @Test
    void consumeで在庫数以上を消費すると例外() {
        Stock stock = Stock.create(1L, 5, LocalDate.of(2026, 5, 1), 7);

        assertThatThrownBy(() -> stock.consume(6))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("在庫数");
    }

    @Test
    void consumeで0以下を消費すると例外() {
        Stock stock = Stock.create(1L, 10, LocalDate.of(2026, 5, 1), 7);

        assertThatThrownBy(() -> stock.consume(0))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("消費数量");
    }

    @Test
    void isExpiredで期限切れを正しく判定する() {
        Stock stock = Stock.create(1L, 10, LocalDate.of(2026, 5, 1), 7);
        // expiryDate = 2026-05-08

        assertThat(stock.isExpired(LocalDate.of(2026, 5, 7))).isFalse();
        assertThat(stock.isExpired(LocalDate.of(2026, 5, 8))).isTrue();
        assertThat(stock.isExpired(LocalDate.of(2026, 5, 9))).isTrue();
    }

    @Test
    void updateStatusで期限切れの在庫はEXPIREDになる() {
        Stock stock = Stock.create(1L, 10, LocalDate.of(2026, 5, 1), 7);

        stock.updateStatus(LocalDate.of(2026, 5, 8));

        assertThat(stock.getStatus()).isEqualTo(StockStatus.EXPIRED);
    }

    @Test
    void updateStatusで期限内の在庫はAVAILABLEのまま() {
        Stock stock = Stock.create(1L, 10, LocalDate.of(2026, 5, 1), 7);

        stock.updateStatus(LocalDate.of(2026, 5, 5));

        assertThat(stock.getStatus()).isEqualTo(StockStatus.AVAILABLE);
    }

    @Test
    void isEmptyで数量が0のときtrueを返す() {
        Stock stock = Stock.create(1L, 5, LocalDate.of(2026, 5, 1), 7);

        stock.consume(5);

        assertThat(stock.isEmpty()).isTrue();
    }

    @Test
    void isEmptyで数量が残っているときfalseを返す() {
        Stock stock = Stock.create(1L, 5, LocalDate.of(2026, 5, 1), 7);

        stock.consume(3);

        assertThat(stock.isEmpty()).isFalse();
    }
}
