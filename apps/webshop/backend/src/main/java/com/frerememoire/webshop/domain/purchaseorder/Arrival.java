package com.frerememoire.webshop.domain.purchaseorder;

import java.time.LocalDateTime;

public class Arrival {

    private Long id;
    private final Long purchaseOrderId;
    private final Long itemId;
    private final int quantity;
    private final LocalDateTime arrivedAt;

    public Arrival(Long id, Long purchaseOrderId, Long itemId, int quantity, LocalDateTime arrivedAt) {
        this.id = id;
        this.purchaseOrderId = purchaseOrderId;
        this.itemId = itemId;
        this.quantity = quantity;
        this.arrivedAt = arrivedAt;
    }

    public static Arrival create(Long purchaseOrderId, Long itemId, int quantity, LocalDateTime arrivedAt) {
        if (purchaseOrderId == null) {
            throw new IllegalArgumentException("発注IDは必須です");
        }
        if (itemId == null) {
            throw new IllegalArgumentException("単品IDは必須です");
        }
        if (quantity <= 0) {
            throw new IllegalArgumentException("数量は1以上である必要があります");
        }
        if (arrivedAt == null) {
            throw new IllegalArgumentException("入荷日時は必須です");
        }
        return new Arrival(null, purchaseOrderId, itemId, quantity, arrivedAt);
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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
