package com.frerememoire.webshop.infrastructure.api.dashboard;

public record DashboardSummaryResponse(
        long totalOrders,
        long orderedCount,
        long lowStockItems,
        long outOfStockItems,
        long bundlingCount,
        long shippingCount
) {
}
