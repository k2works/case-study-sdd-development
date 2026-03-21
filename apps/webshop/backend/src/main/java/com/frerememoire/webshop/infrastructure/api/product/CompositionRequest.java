package com.frerememoire.webshop.infrastructure.api.product;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record CompositionRequest(
        @NotNull(message = "単品IDは必須です")
        Long itemId,

        @Min(value = 1, message = "数量は1以上である必要があります")
        int quantity
) {
}
