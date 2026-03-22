package com.frerememoire.webshop.domain.stock;

import com.frerememoire.webshop.domain.stock.port.InventoryQueryPort;

import java.time.Clock;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class InventoryTransitionService {

    private final Clock clock;
    private final InventoryQueryPort queryPort;

    public InventoryTransitionService(Clock clock, InventoryQueryPort queryPort) {
        this.clock = clock;
        this.queryPort = queryPort;
    }

    public List<DailyInventory> calculateTransition(Long itemId, LocalDate from, LocalDate to) {
        List<DailyInventory> result = new ArrayList<>();
        int previousStock = queryPort.getCurrentStock(itemId);

        LocalDate current = from;
        while (!current.isAfter(to)) {
            int expectedArrivals = queryPort.getExpectedArrivals(itemId, current);
            int orderAllocations = queryPort.getOrderAllocations(itemId, current);
            int expectedExpirations = queryPort.getExpectedExpirations(itemId, current);

            DailyInventory daily = new DailyInventory(
                    current, previousStock, expectedArrivals,
                    orderAllocations, expectedExpirations);

            result.add(daily);
            previousStock = daily.getProjectedStock();
            current = current.plusDays(1);
        }

        return result;
    }

    public Clock getClock() {
        return clock;
    }
}
