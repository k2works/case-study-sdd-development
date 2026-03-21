package com.frerememoire.webshop.infrastructure.api.order;

import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record BulkAcceptRequest(
        @NotEmpty(message = "受注IDリストは必須です")
        List<Long> orderIds
) {
}
