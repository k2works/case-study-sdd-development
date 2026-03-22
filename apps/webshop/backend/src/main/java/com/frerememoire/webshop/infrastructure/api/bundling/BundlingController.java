package com.frerememoire.webshop.infrastructure.api.bundling;

import com.frerememoire.webshop.application.bundling.BundleOrderUseCase;
import com.frerememoire.webshop.application.bundling.BundlingQueryService;
import com.frerememoire.webshop.application.bundling.BundlingTargetsResult;
import com.frerememoire.webshop.domain.order.Order;
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
public class BundlingController {

    private final BundlingQueryService bundlingQueryService;
    private final BundleOrderUseCase bundleOrderUseCase;

    public BundlingController(BundlingQueryService bundlingQueryService,
                               BundleOrderUseCase bundleOrderUseCase) {
        this.bundlingQueryService = bundlingQueryService;
        this.bundleOrderUseCase = bundleOrderUseCase;
    }

    @GetMapping("/targets")
    public ResponseEntity<BundlingTargetsResponse> getTargets(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        LocalDate targetDate = date != null ? date : LocalDate.now();
        BundlingTargetsResult result = bundlingQueryService.getTargets(targetDate);
        return ResponseEntity.ok(BundlingTargetsResponse.fromResult(result));
    }

    @PutMapping("/orders/{orderId}/bundle")
    public ResponseEntity<BundleOrderResponse> bundleOrder(@PathVariable Long orderId) {
        Order order = bundleOrderUseCase.execute(orderId);
        return ResponseEntity.ok(BundleOrderResponse.fromDomain(order));
    }
}
