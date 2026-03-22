package com.frerememoire.webshop.infrastructure.api.item;

import com.frerememoire.webshop.domain.item.Item;

public record ItemResponse(
        Long id,
        String name,
        int qualityRetentionDays,
        int purchaseUnit,
        int leadTimeDays,
        String supplierName
) {
    public static ItemResponse fromDomain(Item item) {
        return new ItemResponse(
                item.getId(),
                item.getName(),
                item.getQualityRetentionDays(),
                item.getPurchaseUnit(),
                item.getLeadTimeDays(),
                item.getSupplierName());
    }
}
