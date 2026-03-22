package com.frerememoire.webshop.application.bundling;

public record MaterialSummary(
        Long itemId,
        String itemName,
        int requiredQuantity,
        int availableStock,
        int shortage
) {
}
