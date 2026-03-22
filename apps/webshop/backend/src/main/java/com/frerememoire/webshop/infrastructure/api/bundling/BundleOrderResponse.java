package com.frerememoire.webshop.infrastructure.api.bundling;

import com.frerememoire.webshop.domain.order.Order;

public record BundleOrderResponse(
        Long orderId,
        String status
) {
    public static BundleOrderResponse fromDomain(Order order) {
        return new BundleOrderResponse(order.getId(), order.getStatus().name());
    }
}
