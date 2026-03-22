package com.frerememoire.webshop.infrastructure.api.purchaseorder;

import com.frerememoire.webshop.application.purchaseorder.PlacePurchaseOrderUseCase;
import com.frerememoire.webshop.application.purchaseorder.PurchaseOrderQueryService;
import com.frerememoire.webshop.domain.purchaseorder.PurchaseOrder;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/purchase-orders")
public class PurchaseOrderController {

    private final PlacePurchaseOrderUseCase placeUseCase;
    private final PurchaseOrderQueryService queryService;

    public PurchaseOrderController(PlacePurchaseOrderUseCase placeUseCase,
                                    PurchaseOrderQueryService queryService) {
        this.placeUseCase = placeUseCase;
        this.queryService = queryService;
    }

    @PostMapping
    public ResponseEntity<PurchaseOrderResponse> create(
            @Valid @RequestBody PurchaseOrderRequest request) {
        PurchaseOrder po = placeUseCase.place(
                request.itemId(), request.quantity(), request.desiredDeliveryDate());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(PurchaseOrderResponse.fromDomain(po));
    }

    @GetMapping
    public ResponseEntity<List<PurchaseOrderResponse>> findAll(
            @RequestParam(required = false) String status) {
        List<PurchaseOrder> orders;
        if (status != null && !status.isEmpty()) {
            orders = queryService.findByStatus(status);
        } else {
            orders = queryService.findAll();
        }
        List<PurchaseOrderResponse> response = orders.stream()
                .map(PurchaseOrderResponse::fromDomain)
                .toList();
        return ResponseEntity.ok(response);
    }
}
