package com.frerememoire.webshop.infrastructure.api.order;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record RescheduleRequest(
        @NotNull LocalDate newDeliveryDate
) {
}
