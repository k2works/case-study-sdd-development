package com.frerememoire.webshop.infrastructure.api.product;

import com.frerememoire.webshop.domain.product.ProductComposition;

public record CompositionResponse(
        Long id,
        Long itemId,
        String itemName,
        int quantity
) {
    public static CompositionResponse fromDomain(ProductComposition composition) {
        return new CompositionResponse(
                composition.getId(),
                composition.getItemId(),
                null,
                composition.getQuantity());
    }

    public static CompositionResponse fromDomain(ProductComposition composition, String itemName) {
        return new CompositionResponse(
                composition.getId(),
                composition.getItemId(),
                itemName,
                composition.getQuantity());
    }
}
