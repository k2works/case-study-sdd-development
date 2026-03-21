package com.frerememoire.webshop.infrastructure.api.product;

import com.frerememoire.webshop.application.product.ProductUseCase;
import com.frerememoire.webshop.domain.product.Product;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/products")
public class ProductController {

    private final ProductUseCase productUseCase;

    public ProductController(ProductUseCase productUseCase) {
        this.productUseCase = productUseCase;
    }

    @GetMapping
    public ResponseEntity<List<ProductResponse>> findAll() {
        List<ProductResponse> products = productUseCase.findAll().stream()
                .map(ProductResponse::fromDomain)
                .toList();
        return ResponseEntity.ok(products);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> findById(@PathVariable Long id) {
        Product product = productUseCase.findById(id);
        return ResponseEntity.ok(ProductResponse.fromDomain(product));
    }

    @PostMapping
    public ResponseEntity<ProductResponse> create(@Valid @RequestBody ProductRequest request) {
        Product product = productUseCase.create(
                request.name(), request.price(), request.description());
        return ResponseEntity.status(HttpStatus.CREATED).body(ProductResponse.fromDomain(product));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> update(@PathVariable Long id,
                                                   @Valid @RequestBody ProductRequest request) {
        Product product = productUseCase.update(id,
                request.name(), request.price(), request.description());
        return ResponseEntity.ok(ProductResponse.fromDomain(product));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        productUseCase.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/compositions")
    public ResponseEntity<List<CompositionResponse>> getCompositions(@PathVariable Long id) {
        Product product = productUseCase.findById(id);
        List<CompositionResponse> compositions = product.getCompositions().stream()
                .map(CompositionResponse::fromDomain)
                .toList();
        return ResponseEntity.ok(compositions);
    }

    @PostMapping("/{id}/compositions")
    public ResponseEntity<ProductResponse> addComposition(@PathVariable Long id,
                                                           @Valid @RequestBody CompositionRequest request) {
        Product product = productUseCase.addComposition(id, request.itemId(), request.quantity());
        return ResponseEntity.status(HttpStatus.CREATED).body(ProductResponse.fromDomain(product));
    }

    @DeleteMapping("/{productId}/compositions/{itemId}")
    public ResponseEntity<ProductResponse> removeComposition(@PathVariable Long productId,
                                                              @PathVariable Long itemId) {
        Product product = productUseCase.removeComposition(productId, itemId);
        return ResponseEntity.ok(ProductResponse.fromDomain(product));
    }
}
