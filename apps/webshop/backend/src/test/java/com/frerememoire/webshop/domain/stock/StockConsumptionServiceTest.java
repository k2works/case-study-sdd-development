package com.frerememoire.webshop.domain.stock;

import com.frerememoire.webshop.domain.shared.BusinessRuleViolationException;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class StockConsumptionServiceTest {

    private final StockConsumptionService service = new StockConsumptionService();

    @Test
    void 単一在庫から必要数量を消費できる() {
        Stock stock = Stock.create(1L, 10, LocalDate.of(2026, 5, 1), 14);

        service.consumeFifo(List.of(stock), 3);

        assertThat(stock.getQuantity()).isEqualTo(7);
    }

    @Test
    void FIFO順に複数在庫から消費する() {
        Stock older = Stock.create(1L, 3, LocalDate.of(2026, 5, 1), 14);
        Stock newer = Stock.create(1L, 10, LocalDate.of(2026, 5, 5), 14);

        service.consumeFifo(List.of(older, newer), 5);

        assertThat(older.getQuantity()).isEqualTo(0);
        assertThat(newer.getQuantity()).isEqualTo(8);
    }

    @Test
    void 在庫を全て消費できる() {
        Stock stock = Stock.create(1L, 5, LocalDate.of(2026, 5, 1), 14);

        service.consumeFifo(List.of(stock), 5);

        assertThat(stock.getQuantity()).isEqualTo(0);
        assertThat(stock.isEmpty()).isTrue();
    }

    @Test
    void 在庫不足の場合は例外が発生する() {
        Stock stock = Stock.create(1L, 3, LocalDate.of(2026, 5, 1), 14);

        assertThatThrownBy(() -> service.consumeFifo(List.of(stock), 5))
                .isInstanceOf(BusinessRuleViolationException.class)
                .hasMessageContaining("在庫が不足しています");
    }

    @Test
    void 空の在庫リストの場合は例外が発生する() {
        assertThatThrownBy(() -> service.consumeFifo(List.of(), 1))
                .isInstanceOf(BusinessRuleViolationException.class)
                .hasMessageContaining("在庫が不足しています");
    }
}
