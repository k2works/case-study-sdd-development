package com.frerememoire.webshop.application.dashboard;

public record DashboardSummary(
        long totalOrders,
        long orderedCount,
        long lowStockItems,
        long outOfStockItems,
        long bundlingCount,
        long shippingCount
) {
}
