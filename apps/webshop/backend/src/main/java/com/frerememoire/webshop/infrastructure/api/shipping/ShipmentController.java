package com.frerememoire.webshop.infrastructure.api.shipping;

import com.frerememoire.webshop.application.shipping.ShipmentQueryService;
import com.frerememoire.webshop.application.shipping.ShipmentTargetsResult;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/admin/shipments")
@Tag(name = "出荷管理", description = "出荷対象一覧")
public class ShipmentController {

    private final ShipmentQueryService shipmentQueryService;

    public ShipmentController(ShipmentQueryService shipmentQueryService) {
        this.shipmentQueryService = shipmentQueryService;
    }

    @Operation(summary = "出荷対象一覧", description = "PREPARING ステータスの受注を届け先情報付きで取得する")
    @GetMapping
    public ResponseEntity<ShipmentTargetsResponse> getTargets(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        LocalDate targetDate = date != null ? date : LocalDate.now();
        ShipmentTargetsResult result = shipmentQueryService.getTargets(targetDate);
        return ResponseEntity.ok(ShipmentTargetsResponse.fromResult(result));
    }
}
