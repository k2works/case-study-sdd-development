package com.frerememoire.webshop.application.bundling;

public record RequiredItem(
        Long itemId,
        String itemName,
        int requiredQuantity
) {
}
