package com.frerememoire.webshop.infrastructure.api.product;

import com.frerememoire.webshop.application.item.ItemUseCase;
import com.frerememoire.webshop.application.product.ProductUseCase;
import com.frerememoire.webshop.domain.item.Item;
import com.frerememoire.webshop.domain.product.Product;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/catalog/products")
public class CatalogController {

    private final ProductUseCase productUseCase;
    private final ItemUseCase itemUseCase;

    public CatalogController(ProductUseCase productUseCase, ItemUseCase itemUseCase) {
        this.productUseCase = productUseCase;
        this.itemUseCase = itemUseCase;
    }

    @GetMapping
    public ResponseEntity<List<ProductResponse>> findAllActive() {
        Map<Long, String> itemNames = resolveItemNames();
        List<ProductResponse> products = productUseCase.findAllActive().stream()
                .map(p -> ProductResponse.fromDomain(p, itemNames))
                .toList();
        return ResponseEntity.ok(products);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> findById(@PathVariable Long id) {
        Product product = productUseCase.findActiveById(id);
        Map<Long, String> itemNames = resolveItemNames();
        return ResponseEntity.ok(ProductResponse.fromDomain(product, itemNames));
    }

    private Map<Long, String> resolveItemNames() {
        return itemUseCase.findAll().stream()
                .collect(Collectors.toMap(Item::getId, Item::getName));
    }
}
