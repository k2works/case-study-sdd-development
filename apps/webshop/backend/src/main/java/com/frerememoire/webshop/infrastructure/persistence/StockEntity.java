package com.frerememoire.webshop.infrastructure.persistence;

import com.frerememoire.webshop.domain.stock.Stock;
import com.frerememoire.webshop.domain.stock.StockStatus;
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
@Table(name = "stocks")
public class StockEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "item_id", nullable = false)
    private Long itemId;

    @Column(nullable = false)
    private int quantity;

    @Column(name = "arrived_date", nullable = false)
    private LocalDate arrivedDate;

    @Column(name = "expiry_date", nullable = false)
    private LocalDate expiryDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StockStatus status;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    protected StockEntity() {
    }

    public static StockEntity fromDomain(Stock stock) {
        StockEntity entity = new StockEntity();
        entity.id = stock.getId();
        entity.itemId = stock.getItemId();
        entity.quantity = stock.getQuantity();
        entity.arrivedDate = stock.getArrivedDate();
        entity.expiryDate = stock.getExpiryDate();
        entity.status = stock.getStatus();
        entity.createdAt = stock.getCreatedAt();
        return entity;
    }

    public Stock toDomain() {
        return new Stock(id, itemId, quantity, arrivedDate, expiryDate, status, createdAt);
    }
}
