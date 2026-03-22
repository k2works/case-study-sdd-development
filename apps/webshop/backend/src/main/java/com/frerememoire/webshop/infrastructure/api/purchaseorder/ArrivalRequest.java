package com.frerememoire.webshop.infrastructure.api.purchaseorder;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record ArrivalRequest(
        @Min(value = 1, message = "数量は1以上である必要があります")
        int quantity,

        @NotNull(message = "入荷日は必須です")
        LocalDate arrivedDate
) {
}
