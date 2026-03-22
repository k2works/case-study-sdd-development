package com.frerememoire.webshop.domain.stock;

import java.time.LocalDate;

public class DailyInventory {

    private final LocalDate date;
    private final int previousStock;
    private final int expectedArrivals;
    private final int orderAllocations;
    private final int expectedExpirations;

    public DailyInventory(LocalDate date, int previousStock, int expectedArrivals,
                          int orderAllocations, int expectedExpirations) {
        this.date = date;
        this.previousStock = previousStock;
        this.expectedArrivals = expectedArrivals;
        this.orderAllocations = orderAllocations;
        this.expectedExpirations = expectedExpirations;
    }

    public int getProjectedStock() {
        return previousStock + expectedArrivals - orderAllocations - expectedExpirations;
    }

    public LocalDate getDate() {
        return date;
    }

    public int getPreviousStock() {
        return previousStock;
    }

    public int getExpectedArrivals() {
        return expectedArrivals;
    }

    public int getOrderAllocations() {
        return orderAllocations;
    }

    public int getExpectedExpirations() {
        return expectedExpirations;
    }
}
