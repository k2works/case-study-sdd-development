package com.frerememoire.webshop.application.customer;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record CustomerDetailResponse(
    Long id,
    String name,
    String email,
    String phone,
    LocalDateTime createdAt,
    List<OrderSummary> orders
) {
    public record OrderSummary(
        Long id,
        String productName,
        LocalDate deliveryDate,
        String status,
        LocalDateTime orderedAt
    ) {}
}
