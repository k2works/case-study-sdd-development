package com.frerememoire.webshop.infrastructure.persistence;

import com.frerememoire.webshop.domain.item.Item;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "items")
public class ItemEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(name = "quality_retention_days", nullable = false)
    private int qualityRetentionDays;

    @Column(name = "purchase_unit", nullable = false)
    private int purchaseUnit;

    @Column(name = "lead_time_days", nullable = false)
    private int leadTimeDays;

    @Column(name = "supplier_name", nullable = false, length = 200)
    private String supplierName;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    protected ItemEntity() {
    }

    public static ItemEntity fromDomain(Item item) {
        ItemEntity entity = new ItemEntity();
        entity.id = item.getId();
        entity.name = item.getName();
        entity.qualityRetentionDays = item.getQualityRetentionDays();
        entity.purchaseUnit = item.getPurchaseUnit();
        entity.leadTimeDays = item.getLeadTimeDays();
        entity.supplierName = item.getSupplierName();
        entity.createdAt = item.getCreatedAt();
        entity.updatedAt = item.getUpdatedAt();
        return entity;
    }

    public Item toDomain() {
        return new Item(id, name, qualityRetentionDays, purchaseUnit,
                leadTimeDays, supplierName, createdAt, updatedAt);
    }
}
