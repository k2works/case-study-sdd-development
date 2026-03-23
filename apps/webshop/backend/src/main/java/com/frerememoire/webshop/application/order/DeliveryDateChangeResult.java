package com.frerememoire.webshop.application.order;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public record DeliveryDateChangeResult(
        boolean available,
        String reason,
        Map<String, Integer> shortageItems,
        List<LocalDate> alternativeDates
) {
    public static DeliveryDateChangeResult success() {
        return new DeliveryDateChangeResult(true, null, Map.of(), List.of());
    }

    public static DeliveryDateChangeResult failure(String reason,
                                                     Map<String, Integer> shortageItems,
                                                     List<LocalDate> alternativeDates) {
        return new DeliveryDateChangeResult(false, reason, shortageItems, alternativeDates);
    }
}
