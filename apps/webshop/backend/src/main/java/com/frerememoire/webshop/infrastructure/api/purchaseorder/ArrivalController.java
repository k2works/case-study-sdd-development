package com.frerememoire.webshop.infrastructure.api.purchaseorder;

import com.frerememoire.webshop.application.purchaseorder.RegisterArrivalCommand;
import com.frerememoire.webshop.application.purchaseorder.RegisterArrivalUseCase;
import com.frerememoire.webshop.domain.purchaseorder.Arrival;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/purchase-orders/{purchaseOrderId}/arrivals")
@Tag(name = "発注管理")
public class ArrivalController {

    private final RegisterArrivalUseCase registerArrivalUseCase;

    public ArrivalController(RegisterArrivalUseCase registerArrivalUseCase) {
        this.registerArrivalUseCase = registerArrivalUseCase;
    }

    @Operation(summary = "入荷登録", description = "発注に対する入荷を登録し在庫を追加する")
    @PostMapping
    public ResponseEntity<ArrivalResponse> register(
            @PathVariable Long purchaseOrderId,
            @Valid @RequestBody ArrivalRequest request) {
        RegisterArrivalCommand command = new RegisterArrivalCommand(
                purchaseOrderId, request.quantity(), request.arrivedDate());
        Arrival arrival = registerArrivalUseCase.execute(command);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ArrivalResponse.fromDomain(arrival));
    }
}
