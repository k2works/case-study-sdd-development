package com.frerememoire.webshop.application.order.dto;

public record DashboardSummary(
        long totalOrders,
        long orderedCount,
        long acceptedCount
) {
}
