package com.frerememoire.webshop.infrastructure.api.bundling;

import com.frerememoire.webshop.application.bundling.BundleOrderUseCase;
import com.frerememoire.webshop.application.bundling.BundlingQueryService;
import com.frerememoire.webshop.application.bundling.BundlingTargetsResult;
import com.frerememoire.webshop.domain.order.Order;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/admin/bundling")
@Tag(name = "結束管理", description = "結束対象確認と結束完了登録")
public class BundlingController {

    private final BundlingQueryService bundlingQueryService;
    private final BundleOrderUseCase bundleOrderUseCase;

    public BundlingController(BundlingQueryService bundlingQueryService,
                               BundleOrderUseCase bundleOrderUseCase) {
        this.bundlingQueryService = bundlingQueryService;
        this.bundleOrderUseCase = bundleOrderUseCase;
    }

    @Operation(summary = "結束対象一覧", description = "指定日の結束対象受注と花材所要量を取得する")
    @GetMapping("/targets")
    public ResponseEntity<BundlingTargetsResponse> getTargets(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        LocalDate targetDate = date != null ? date : LocalDate.now();
        BundlingTargetsResult result = bundlingQueryService.getTargets(targetDate);
        return ResponseEntity.ok(BundlingTargetsResponse.fromResult(result));
    }

    @Operation(summary = "結束完了", description = "FIFO で在庫を消費し ACCEPTED → PREPARING に遷移する")
    @PutMapping("/orders/{orderId}/bundle")
    public ResponseEntity<BundleOrderResponse> bundleOrder(@PathVariable Long orderId) {
        Order order = bundleOrderUseCase.execute(orderId);
        return ResponseEntity.ok(BundleOrderResponse.fromDomain(order));
    }
}
