package com.frerememoire.webshop.infrastructure.api.purchaseorder;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record PurchaseOrderRequest(
        @NotNull(message = "単品IDは必須です")
        Long itemId,

        @Min(value = 1, message = "数量は1以上である必要があります")
        int quantity,

        @NotNull(message = "希望納品日は必須です")
        LocalDate desiredDeliveryDate
) {
}
