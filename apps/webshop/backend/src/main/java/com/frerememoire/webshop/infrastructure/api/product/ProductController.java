package com.frerememoire.webshop.infrastructure.api.product;

import com.frerememoire.webshop.application.item.ItemUseCase;
import com.frerememoire.webshop.application.product.ProductUseCase;
import com.frerememoire.webshop.domain.item.Item;
import com.frerememoire.webshop.domain.product.Product;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(name = "商品管理", description = "商品（花束）の CRUD と構成管理")
public class ProductController {

    private final ProductUseCase productUseCase;
    private final ItemUseCase itemUseCase;

    public ProductController(ProductUseCase productUseCase, ItemUseCase itemUseCase) {
        this.productUseCase = productUseCase;
        this.itemUseCase = itemUseCase;
    }

    @Operation(summary = "商品一覧取得")
    @GetMapping
    public ResponseEntity<List<ProductResponse>> findAll() {
        Map<Long, String> itemNames = resolveItemNames();
        List<ProductResponse> products = productUseCase.findAll().stream()
                .map(p -> ProductResponse.fromDomain(p, itemNames))
                .toList();
        return ResponseEntity.ok(products);
    }

    @Operation(summary = "商品詳細取得")
    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> findById(@PathVariable Long id) {
        Product product = productUseCase.findById(id);
        Map<Long, String> itemNames = resolveItemNames();
        return ResponseEntity.ok(ProductResponse.fromDomain(product, itemNames));
    }

    @Operation(summary = "商品登録")
    @PostMapping
    public ResponseEntity<ProductResponse> create(@Valid @RequestBody ProductRequest request) {
        Product product = productUseCase.create(
                request.name(), request.price(), request.description());
        return ResponseEntity.status(HttpStatus.CREATED).body(ProductResponse.fromDomain(product));
    }

    @Operation(summary = "商品更新")
    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> update(@PathVariable Long id,
                                                   @Valid @RequestBody ProductRequest request) {
        Product product = productUseCase.update(id,
                request.name(), request.price(), request.description());
        return ResponseEntity.ok(ProductResponse.fromDomain(product));
    }

    @Operation(summary = "商品削除")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        productUseCase.delete(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "構成一覧取得", description = "花束の構成（花材リスト）を取得する")
    @GetMapping("/{id}/compositions")
    public ResponseEntity<List<CompositionResponse>> getCompositions(@PathVariable Long id) {
        Product product = productUseCase.findById(id);
        Map<Long, String> itemNames = resolveItemNames();
        List<CompositionResponse> compositions = product.getCompositions().stream()
                .map(c -> CompositionResponse.fromDomain(c, itemNames.getOrDefault(c.getItemId(), null)))
                .toList();
        return ResponseEntity.ok(compositions);
    }

    @Operation(summary = "構成追加", description = "花束に花材を追加する")
    @PostMapping("/{id}/compositions")
    public ResponseEntity<ProductResponse> addComposition(@PathVariable Long id,
                                                           @Valid @RequestBody CompositionRequest request) {
        Product product = productUseCase.addComposition(id, request.itemId(), request.quantity());
        Map<Long, String> itemNames = resolveItemNames();
        return ResponseEntity.status(HttpStatus.CREATED).body(ProductResponse.fromDomain(product, itemNames));
    }

    @Operation(summary = "構成削除", description = "花束から花材を削除する")
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
