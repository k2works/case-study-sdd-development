package com.frerememoire.webshop.infrastructure.api.product;

import com.frerememoire.webshop.domain.product.ProductComposition;

public record CompositionResponse(
        Long id,
        Long itemId,
        int quantity
) {
    public static CompositionResponse fromDomain(ProductComposition composition) {
        return new CompositionResponse(
                composition.getId(),
                composition.getItemId(),
                composition.getQuantity());
    }
}
