package com.frerememoire.webshop.domain.stock;

import com.frerememoire.webshop.domain.stock.port.InventoryQueryPort;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class InventoryTransitionServiceTest {

    private InventoryQueryPort queryPort;
    private InventoryTransitionService service;
    private static final LocalDate TODAY = LocalDate.of(2026, 5, 5);

    @BeforeEach
    void setUp() {
        queryPort = mock(InventoryQueryPort.class);
        Clock fixedClock = Clock.fixed(
                ZonedDateTime.of(TODAY.atStartOfDay(), ZoneId.systemDefault()).toInstant(),
                ZoneId.systemDefault());
        service = new InventoryTransitionService(fixedClock, queryPort);
    }

    @Test
    void 日別在庫推移を計算できる() {
        Long itemId = 1L;
        LocalDate from = LocalDate.of(2026, 5, 5);
        LocalDate to = LocalDate.of(2026, 5, 7);

        when(queryPort.getCurrentStock(itemId)).thenReturn(100);

        // Day 1: 2026-05-05
        when(queryPort.getExpectedArrivals(itemId, from)).thenReturn(20);
        when(queryPort.getOrderAllocations(itemId, from)).thenReturn(10);
        when(queryPort.getExpectedExpirations(itemId, from)).thenReturn(5);

        // Day 2: 2026-05-06
        when(queryPort.getExpectedArrivals(itemId, from.plusDays(1))).thenReturn(0);
        when(queryPort.getOrderAllocations(itemId, from.plusDays(1))).thenReturn(15);
        when(queryPort.getExpectedExpirations(itemId, from.plusDays(1))).thenReturn(0);

        // Day 3: 2026-05-07
        when(queryPort.getExpectedArrivals(itemId, from.plusDays(2))).thenReturn(30);
        when(queryPort.getOrderAllocations(itemId, from.plusDays(2))).thenReturn(0);
        when(queryPort.getExpectedExpirations(itemId, from.plusDays(2))).thenReturn(10);

        List<DailyInventory> result = service.calculateTransition(itemId, from, to);

        assertThat(result).hasSize(3);

        // Day 1: 100 + 20 - 10 - 5 = 105
        assertThat(result.get(0).getDate()).isEqualTo(from);
        assertThat(result.get(0).getPreviousStock()).isEqualTo(100);
        assertThat(result.get(0).getProjectedStock()).isEqualTo(105);

        // Day 2: 105 + 0 - 15 - 0 = 90
        assertThat(result.get(1).getDate()).isEqualTo(from.plusDays(1));
        assertThat(result.get(1).getPreviousStock()).isEqualTo(105);
        assertThat(result.get(1).getProjectedStock()).isEqualTo(90);

        // Day 3: 90 + 30 - 0 - 10 = 110
        assertThat(result.get(2).getDate()).isEqualTo(from.plusDays(2));
        assertThat(result.get(2).getPreviousStock()).isEqualTo(90);
        assertThat(result.get(2).getProjectedStock()).isEqualTo(110);
    }

    @Test
    void 在庫ゼロからの推移を計算できる() {
        Long itemId = 1L;
        LocalDate from = LocalDate.of(2026, 5, 5);
        LocalDate to = LocalDate.of(2026, 5, 5);

        when(queryPort.getCurrentStock(itemId)).thenReturn(0);
        when(queryPort.getExpectedArrivals(itemId, from)).thenReturn(0);
        when(queryPort.getOrderAllocations(itemId, from)).thenReturn(0);
        when(queryPort.getExpectedExpirations(itemId, from)).thenReturn(0);

        List<DailyInventory> result = service.calculateTransition(itemId, from, to);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getProjectedStock()).isEqualTo(0);
    }

    @Test
    void マイナス在庫が発生するケース() {
        Long itemId = 1L;
        LocalDate from = LocalDate.of(2026, 5, 5);
        LocalDate to = LocalDate.of(2026, 5, 5);

        when(queryPort.getCurrentStock(itemId)).thenReturn(5);
        when(queryPort.getExpectedArrivals(itemId, from)).thenReturn(0);
        when(queryPort.getOrderAllocations(itemId, from)).thenReturn(10);
        when(queryPort.getExpectedExpirations(itemId, from)).thenReturn(0);

        List<DailyInventory> result = service.calculateTransition(itemId, from, to);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getProjectedStock()).isEqualTo(-5);
    }
}
