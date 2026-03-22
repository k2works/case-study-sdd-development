package com.frerememoire.webshop.infrastructure.api.purchaseorder;

import com.frerememoire.webshop.domain.purchaseorder.PurchaseOrder;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record PurchaseOrderResponse(
        Long id,
        Long itemId,
        String supplierName,
        int quantity,
        LocalDate desiredDeliveryDate,
        String status,
        LocalDateTime orderedAt,
        int arrivedQuantity
) {
    public static PurchaseOrderResponse fromDomain(PurchaseOrder po) {
        return fromDomain(po, 0);
    }

    public static PurchaseOrderResponse fromDomain(PurchaseOrder po, int arrivedQuantity) {
        return new PurchaseOrderResponse(
                po.getId(),
                po.getItemId(),
                po.getSupplierName(),
                po.getQuantity(),
                po.getDesiredDeliveryDate(),
                po.getStatus().name(),
                po.getOrderedAt(),
                arrivedQuantity);
    }
}
