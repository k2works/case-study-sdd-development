package com.frerememoire.webshop.infrastructure.api.shipping;

import com.frerememoire.webshop.application.shipping.ShipmentTarget;
import com.frerememoire.webshop.application.shipping.ShipmentTargetsResult;

import java.time.LocalDate;
import java.util.List;

public record ShipmentTargetsResponse(
        LocalDate deliveryDate,
        List<ShipmentTarget> targets
) {
    public static ShipmentTargetsResponse fromResult(ShipmentTargetsResult result) {
        return new ShipmentTargetsResponse(
                result.deliveryDate(),
                result.targets()
        );
    }
}
