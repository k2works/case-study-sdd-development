package com.frerememoire.webshop.infrastructure.api.product;

import com.frerememoire.webshop.application.item.ItemUseCase;
import com.frerememoire.webshop.application.product.ProductUseCase;
import com.frerememoire.webshop.domain.item.Item;
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
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/products")
public class ProductController {

    private final ProductUseCase productUseCase;
    private final ItemUseCase itemUseCase;

    public ProductController(ProductUseCase productUseCase, ItemUseCase itemUseCase) {
        this.productUseCase = productUseCase;
        this.itemUseCase = itemUseCase;
    }

    @GetMapping
    public ResponseEntity<List<ProductResponse>> findAll() {
        Map<Long, String> itemNames = resolveItemNames();
        List<ProductResponse> products = productUseCase.findAll().stream()
                .map(p -> ProductResponse.fromDomain(p, itemNames))
                .toList();
        return ResponseEntity.ok(products);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> findById(@PathVariable Long id) {
        Product product = productUseCase.findById(id);
        Map<Long, String> itemNames = resolveItemNames();
        return ResponseEntity.ok(ProductResponse.fromDomain(product, itemNames));
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
        Map<Long, String> itemNames = resolveItemNames();
        List<CompositionResponse> compositions = product.getCompositions().stream()
                .map(c -> CompositionResponse.fromDomain(c, itemNames.getOrDefault(c.getItemId(), null)))
                .toList();
        return ResponseEntity.ok(compositions);
    }

    @PostMapping("/{id}/compositions")
    public ResponseEntity<ProductResponse> addComposition(@PathVariable Long id,
                                                           @Valid @RequestBody CompositionRequest request) {
        Product product = productUseCase.addComposition(id, request.itemId(), request.quantity());
        Map<Long, String> itemNames = resolveItemNames();
        return ResponseEntity.status(HttpStatus.CREATED).body(ProductResponse.fromDomain(product, itemNames));
    }

    @DeleteMapping("/{productId}/compositions/{itemId}")
    public ResponseEntity<ProductResponse> removeComposition(@PathVariable Long productId,
                                                              @PathVariable Long itemId) {
        Product product = productUseCase.removeComposition(productId, itemId);
        Map<Long, String> itemNames = resolveItemNames();
        return ResponseEntity.ok(ProductResponse.fromDomain(product, itemNames));
    }

    private Map<Long, String> resolveItemNames() {
        return itemUseCase.findAll().stream()
                .collect(Collectors.toMap(Item::getId, Item::getName));
    }
}
