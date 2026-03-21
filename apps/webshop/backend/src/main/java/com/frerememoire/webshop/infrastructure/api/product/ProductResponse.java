package com.frerememoire.webshop.infrastructure.api.product;

import com.frerememoire.webshop.domain.product.Product;

import java.util.List;
import java.util.Map;

public record ProductResponse(
        Long id,
        String name,
        int price,
        String description,
        boolean active,
        List<CompositionResponse> compositions
) {
    public static ProductResponse fromDomain(Product product) {
        List<CompositionResponse> compositionResponses = product.getCompositions().stream()
                .map(CompositionResponse::fromDomain)
                .toList();
        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getPrice(),
                product.getDescription(),
                product.isActive(),
                compositionResponses);
    }

    public static ProductResponse fromDomain(Product product, Map<Long, String> itemNames) {
        List<CompositionResponse> compositionResponses = product.getCompositions().stream()
                .map(c -> CompositionResponse.fromDomain(c, itemNames.getOrDefault(c.getItemId(), null)))
                .toList();
        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getPrice(),
                product.getDescription(),
                product.isActive(),
                compositionResponses);
    }
}
