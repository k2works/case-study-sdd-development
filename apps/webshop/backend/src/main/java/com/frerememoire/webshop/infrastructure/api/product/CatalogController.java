package com.frerememoire.webshop.infrastructure.api.product;

import com.frerememoire.webshop.application.product.ProductUseCase;
import com.frerememoire.webshop.domain.product.Product;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/catalog/products")
public class CatalogController {

    private final ProductUseCase productUseCase;

    public CatalogController(ProductUseCase productUseCase) {
        this.productUseCase = productUseCase;
    }

    @GetMapping
    public ResponseEntity<List<ProductResponse>> findAllActive() {
        List<ProductResponse> products = productUseCase.findAllActive().stream()
                .map(ProductResponse::fromDomain)
                .toList();
        return ResponseEntity.ok(products);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> findById(@PathVariable Long id) {
        Product product = productUseCase.findById(id);
        return ResponseEntity.ok(ProductResponse.fromDomain(product));
    }
}
