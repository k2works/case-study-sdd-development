package com.frerememoire.webshop.infrastructure.api.order;

import com.frerememoire.webshop.application.order.DeliveryDateChangeResult;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public record RescheduleCheckResponse(
        boolean available,
        String reason,
        Map<String, Integer> shortageItems,
        List<LocalDate> alternativeDates
) {
    public static RescheduleCheckResponse fromResult(DeliveryDateChangeResult result) {
        return new RescheduleCheckResponse(
                result.available(),
                result.reason(),
                result.shortageItems(),
                result.alternativeDates()
        );
    }
}
