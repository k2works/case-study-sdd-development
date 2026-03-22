package com.frerememoire.webshop.domain.stock.port;

import java.time.LocalDate;

public interface InventoryQueryPort {

    int getCurrentStock(Long itemId);

    int getExpectedArrivals(Long itemId, LocalDate date);

    int getOrderAllocations(Long itemId, LocalDate date);

    int getExpectedExpirations(Long itemId, LocalDate date);
}
