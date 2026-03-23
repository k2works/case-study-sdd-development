package com.frerememoire.webshop.infrastructure.api.product;

import com.frerememoire.webshop.application.item.ItemUseCase;
import com.frerememoire.webshop.application.product.ProductUseCase;
import com.frerememoire.webshop.domain.item.Item;
import com.frerememoire.webshop.domain.product.Product;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(name = "カタログ", description = "公開商品カタログ（認証不要）")
@SecurityRequirement(name = "")
public class CatalogController {

    private final ProductUseCase productUseCase;
    private final ItemUseCase itemUseCase;

    public CatalogController(ProductUseCase productUseCase, ItemUseCase itemUseCase) {
        this.productUseCase = productUseCase;
        this.itemUseCase = itemUseCase;
    }

    @Operation(summary = "商品一覧", description = "公開中の商品一覧を取得する")
    @GetMapping
    public ResponseEntity<List<ProductResponse>> findAllActive() {
        Map<Long, String> itemNames = resolveItemNames();
        List<ProductResponse> products = productUseCase.findAllActive().stream()
                .map(p -> ProductResponse.fromDomain(p, itemNames))
                .toList();
        return ResponseEntity.ok(products);
    }

    @Operation(summary = "商品詳細", description = "指定 ID の公開商品を取得する")
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
