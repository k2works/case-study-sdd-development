package com.frerememoire.webshop.infrastructure.api.purchaseorder;

import com.frerememoire.webshop.domain.purchaseorder.Arrival;

import java.time.LocalDateTime;

public record ArrivalResponse(
        Long id,
        Long purchaseOrderId,
        Long itemId,
        int quantity,
        LocalDateTime arrivedAt
) {
    public static ArrivalResponse fromDomain(Arrival arrival) {
        return new ArrivalResponse(
                arrival.getId(),
                arrival.getPurchaseOrderId(),
                arrival.getItemId(),
                arrival.getQuantity(),
                arrival.getArrivedAt());
    }
}
