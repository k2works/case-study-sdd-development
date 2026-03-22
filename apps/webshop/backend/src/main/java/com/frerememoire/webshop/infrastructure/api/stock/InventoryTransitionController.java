package com.frerememoire.webshop.infrastructure.api.stock;

import com.frerememoire.webshop.application.stock.InventoryTransitionUseCase;
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
public class InventoryTransitionController {

    private final InventoryTransitionUseCase useCase;

    public InventoryTransitionController(InventoryTransitionUseCase useCase) {
        this.useCase = useCase;
    }

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
