package com.frerememoire.webshop.infrastructure.api.order;

public record DashboardSummaryResponse(
        long totalOrders,
        long orderedCount,
        long acceptedCount
) {
}
