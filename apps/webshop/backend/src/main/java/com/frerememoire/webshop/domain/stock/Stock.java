package com.frerememoire.webshop.domain.stock;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class Stock {

    private Long id;
    private final Long itemId;
    private int quantity;
    private final LocalDate arrivedDate;
    private final LocalDate expiryDate;
    private StockStatus status;
    private final LocalDateTime createdAt;

    public Stock(Long id, Long itemId, int quantity, LocalDate arrivedDate,
                 LocalDate expiryDate, StockStatus status, LocalDateTime createdAt) {
        if (itemId == null) {
            throw new IllegalArgumentException("単品IDは必須です");
        }
        if (quantity <= 0) {
            throw new IllegalArgumentException("数量は1以上である必要があります");
        }
        if (arrivedDate == null) {
            throw new IllegalArgumentException("入荷日は必須です");
        }
        if (expiryDate == null) {
            throw new IllegalArgumentException("有効期限は必須です");
        }
        if (status == null) {
            throw new IllegalArgumentException("ステータスは必須です");
        }
        this.id = id;
        this.itemId = itemId;
        this.quantity = quantity;
        this.arrivedDate = arrivedDate;
        this.expiryDate = expiryDate;
        this.status = status;
        this.createdAt = createdAt;
    }

    public static Stock create(Long itemId, int quantity, LocalDate arrivedDate,
                                int qualityRetentionDays) {
        return create(itemId, quantity, arrivedDate, qualityRetentionDays, Clock.systemDefaultZone());
    }

    public static Stock create(Long itemId, int quantity, LocalDate arrivedDate,
                                int qualityRetentionDays, Clock clock) {
        if (arrivedDate == null) {
            throw new IllegalArgumentException("入荷日は必須です");
        }
        if (qualityRetentionDays <= 0) {
            throw new IllegalArgumentException("品質保持日数は1以上である必要があります");
        }
        LocalDate expiryDate = arrivedDate.plusDays(qualityRetentionDays);
        return new Stock(null, itemId, quantity, arrivedDate, expiryDate,
                StockStatus.AVAILABLE, LocalDateTime.now(clock));
    }

    public void consume(int qty) {
        if (qty <= 0) {
            throw new IllegalArgumentException("消費数量は1以上である必要があります");
        }
        if (qty > this.quantity) {
            throw new IllegalArgumentException("在庫数を超えて消費することはできません");
        }
        this.quantity -= qty;
    }

    public boolean isExpired(LocalDate today) {
        return !today.isBefore(expiryDate);
    }

    public void updateStatus(LocalDate today) {
        if (isExpired(today)) {
            this.status = StockStatus.EXPIRED;
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getItemId() {
        return itemId;
    }

    public int getQuantity() {
        return quantity;
    }

    public LocalDate getArrivedDate() {
        return arrivedDate;
    }

    public LocalDate getExpiryDate() {
        return expiryDate;
    }

    public StockStatus getStatus() {
        return status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
