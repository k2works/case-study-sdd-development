package com.frerememoire.webshop.infrastructure.api.stock;

import com.frerememoire.webshop.application.stock.InventoryTransitionUseCase;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/inventory")
@Tag(name = "在庫管理", description = "在庫推移表示")
public class InventoryTransitionController {

    private final InventoryTransitionUseCase useCase;

    public InventoryTransitionController(InventoryTransitionUseCase useCase) {
        this.useCase = useCase;
    }

    @Operation(summary = "在庫推移取得", description = "指定期間の日別在庫推移（現在庫・入荷予定・受注引当・期限切れ）を取得する")
    @GetMapping("/transition")
    public ResponseEntity<List<DailyInventoryResponse>> getTransition(
            @RequestParam Long itemId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        List<DailyInventoryResponse> response = useCase.getTransition(itemId, from, to)
                .stream()
                .map(DailyInventoryResponse::fromDomain)
                .toList();
        return ResponseEntity.ok(response);
    }
}
