package com.frerememoire.webshop.infrastructure.api.order;

import com.frerememoire.webshop.domain.order.Order;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record OrderResponse(
        Long id,
        Long customerId,
        Long productId,
        Long deliveryDestinationId,
        LocalDate deliveryDate,
        String message,
        String status,
        LocalDateTime orderedAt,
        LocalDateTime updatedAt,
        String productName,
        String customerName,
        String recipientName,
        String deliveryAddress
) {
    public static OrderResponse fromDomain(Order order) {
        return new OrderResponse(
                order.getId(),
                order.getCustomerId(),
                order.getProductId(),
                order.getDeliveryDestinationId(),
                order.getDeliveryDateValue(),
                order.getMessageValue(),
                order.getStatus().name(),
                order.getOrderedAt(),
                order.getUpdatedAt(),
                null, null, null, null);
    }

    public static OrderResponse fromDomainWithDetails(Order order, String productName,
                                                       String customerName, String recipientName,
                                                       String deliveryAddress) {
        return new OrderResponse(
                order.getId(),
                order.getCustomerId(),
                order.getProductId(),
                order.getDeliveryDestinationId(),
                order.getDeliveryDateValue(),
                order.getMessageValue(),
                order.getStatus().name(),
                order.getOrderedAt(),
                order.getUpdatedAt(),
                productName, customerName, recipientName, deliveryAddress);
    }
}
