package com.frerememoire.webshop.application.purchaseorder;

import java.time.LocalDate;

public record RegisterArrivalCommand(
        Long purchaseOrderId,
        int quantity,
        LocalDate arrivedDate
) {
}
