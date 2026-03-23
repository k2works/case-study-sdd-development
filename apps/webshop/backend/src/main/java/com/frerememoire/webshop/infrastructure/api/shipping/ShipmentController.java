package com.frerememoire.webshop.infrastructure.api.shipping;

import com.frerememoire.webshop.application.shipping.ShipmentQueryService;
import com.frerememoire.webshop.application.shipping.ShipmentTargetsResult;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/admin/shipments")
public class ShipmentController {

    private final ShipmentQueryService shipmentQueryService;

    public ShipmentController(ShipmentQueryService shipmentQueryService) {
        this.shipmentQueryService = shipmentQueryService;
    }

    @GetMapping
    public ResponseEntity<ShipmentTargetsResponse> getTargets(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        LocalDate targetDate = date != null ? date : LocalDate.now();
        ShipmentTargetsResult result = shipmentQueryService.getTargets(targetDate);
        return ResponseEntity.ok(ShipmentTargetsResponse.fromResult(result));
    }
}
