package com.frerememoire.webshop.infrastructure.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "arrivals")
public class ArrivalEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "purchase_order_id", nullable = false)
    private Long purchaseOrderId;

    @Column(name = "item_id", nullable = false)
    private Long itemId;

    @Column(nullable = false)
    private int quantity;

    @Column(name = "arrived_at", nullable = false)
    private LocalDateTime arrivedAt;

    protected ArrivalEntity() {
    }

    public Long getId() {
        return id;
    }

    public Long getPurchaseOrderId() {
        return purchaseOrderId;
    }

    public Long getItemId() {
        return itemId;
    }

    public int getQuantity() {
        return quantity;
    }

    public LocalDateTime getArrivedAt() {
        return arrivedAt;
    }
}
