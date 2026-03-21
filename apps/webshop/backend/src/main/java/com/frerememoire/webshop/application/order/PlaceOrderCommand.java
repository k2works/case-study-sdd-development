package com.frerememoire.webshop.application.order;

import java.time.LocalDate;

public record PlaceOrderCommand(
        Long userId,
        Long productId,
        LocalDate deliveryDate,
        String recipientName,
        String postalCode,
        String address,
        String phone,
        String message
) {
}
