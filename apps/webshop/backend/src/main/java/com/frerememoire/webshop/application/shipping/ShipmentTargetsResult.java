package com.frerememoire.webshop.application.shipping;

import java.time.LocalDate;
import java.util.List;

public record ShipmentTargetsResult(
        LocalDate deliveryDate,
        List<ShipmentTarget> targets
) {
}
