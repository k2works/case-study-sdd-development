package com.frerememoire.webshop.infrastructure.persistence;

import com.frerememoire.webshop.domain.purchaseorder.PurchaseOrder;
import com.frerememoire.webshop.domain.purchaseorder.PurchaseOrderStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "purchase_orders")
public class PurchaseOrderEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "item_id", nullable = false)
    private Long itemId;

    @Column(name = "supplier_name", nullable = false, length = 200)
    private String supplierName;

    @Column(nullable = false)
    private int quantity;

    @Column(name = "desired_delivery_date", nullable = false)
    private LocalDate desiredDeliveryDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PurchaseOrderStatus status;

    @Column(name = "ordered_at", nullable = false)
    private LocalDateTime orderedAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    protected PurchaseOrderEntity() {
    }

    public static PurchaseOrderEntity fromDomain(PurchaseOrder po) {
        PurchaseOrderEntity entity = new PurchaseOrderEntity();
        entity.id = po.getId();
        entity.itemId = po.getItemId();
        entity.supplierName = po.getSupplierName();
        entity.quantity = po.getQuantity();
        entity.desiredDeliveryDate = po.getDesiredDeliveryDate();
        entity.status = po.getStatus();
        entity.orderedAt = po.getOrderedAt();
        entity.updatedAt = po.getUpdatedAt();
        return entity;
    }

    public PurchaseOrder toDomain() {
        return new PurchaseOrder(id, itemId, supplierName, quantity,
                desiredDeliveryDate, status, orderedAt, updatedAt);
    }
}
