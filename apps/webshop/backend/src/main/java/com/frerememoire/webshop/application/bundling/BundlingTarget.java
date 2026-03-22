package com.frerememoire.webshop.application.bundling;

import java.time.LocalDate;
import java.util.List;

public record BundlingTarget(
        Long orderId,
        String productName,
        LocalDate deliveryDate,
        String status,
        List<RequiredItem> requiredItems
) {
}
