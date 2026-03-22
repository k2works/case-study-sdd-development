package com.frerememoire.webshop.infrastructure.api.stock;

import com.frerememoire.webshop.domain.stock.DailyInventory;

import java.time.LocalDate;

public record DailyInventoryResponse(
        LocalDate date,
        int previousStock,
        int expectedArrivals,
        int orderAllocations,
        int expectedExpirations,
        int projectedStock
) {
    public static DailyInventoryResponse fromDomain(DailyInventory daily) {
        return new DailyInventoryResponse(
                daily.getDate(),
                daily.getPreviousStock(),
                daily.getExpectedArrivals(),
                daily.getOrderAllocations(),
                daily.getExpectedExpirations(),
                daily.getProjectedStock());
    }
}
