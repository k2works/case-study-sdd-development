package com.frerememoire.webshop.infrastructure.api.item;

import com.frerememoire.webshop.application.item.ItemUseCase;
import com.frerememoire.webshop.domain.item.Item;
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

@RestController
@RequestMapping("/api/v1/items")
@Tag(name = "単品管理", description = "単品（花材）の CRUD")
public class ItemController {

    private final ItemUseCase itemUseCase;

    public ItemController(ItemUseCase itemUseCase) {
        this.itemUseCase = itemUseCase;
    }

    @Operation(summary = "単品一覧取得")
    @GetMapping
    public ResponseEntity<List<ItemResponse>> findAll() {
        List<ItemResponse> items = itemUseCase.findAll().stream()
                .map(ItemResponse::fromDomain)
                .toList();
        return ResponseEntity.ok(items);
    }

    @Operation(summary = "単品詳細取得")
    @GetMapping("/{id}")
    public ResponseEntity<ItemResponse> findById(@PathVariable Long id) {
        Item item = itemUseCase.findById(id);
        return ResponseEntity.ok(ItemResponse.fromDomain(item));
    }

    @Operation(summary = "単品登録")
    @PostMapping
    public ResponseEntity<ItemResponse> create(@Valid @RequestBody ItemRequest request) {
        Item item = itemUseCase.create(
                request.name(), request.qualityRetentionDays(), request.purchaseUnit(),
                request.leadTimeDays(), request.supplierName());
        return ResponseEntity.status(HttpStatus.CREATED).body(ItemResponse.fromDomain(item));
    }

    @Operation(summary = "単品更新")
    @PutMapping("/{id}")
    public ResponseEntity<ItemResponse> update(@PathVariable Long id,
                                                @Valid @RequestBody ItemRequest request) {
        Item item = itemUseCase.update(id,
                request.name(), request.qualityRetentionDays(), request.purchaseUnit(),
                request.leadTimeDays(), request.supplierName());
        return ResponseEntity.ok(ItemResponse.fromDomain(item));
    }

    @Operation(summary = "単品削除")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        itemUseCase.delete(id);
        return ResponseEntity.noContent().build();
    }
}
