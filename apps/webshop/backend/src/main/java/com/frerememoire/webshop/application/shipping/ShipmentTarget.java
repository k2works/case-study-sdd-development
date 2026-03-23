package com.frerememoire.webshop.application.shipping;

import java.time.LocalDate;

public record ShipmentTarget(
        Long orderId,
        String productName,
        LocalDate deliveryDate,
        String status,
        String recipientName,
        String deliveryAddress
) {
}
