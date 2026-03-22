package com.frerememoire.webshop.domain.purchaseorder;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class PurchaseOrder {

    private static final int MAX_SUPPLIER_NAME_LENGTH = 200;

    private Long id;
    private final Long itemId;
    private final String supplierName;
    private final int quantity;
    private final LocalDate desiredDeliveryDate;
    private PurchaseOrderStatus status;
    private final LocalDateTime orderedAt;
    private LocalDateTime updatedAt;

    public PurchaseOrder(Long id, Long itemId, String supplierName, int quantity,
                         LocalDate desiredDeliveryDate, PurchaseOrderStatus status,
                         LocalDateTime orderedAt, LocalDateTime updatedAt) {
        this.id = id;
        this.itemId = itemId;
        this.supplierName = supplierName;
        this.quantity = quantity;
        this.desiredDeliveryDate = desiredDeliveryDate;
        this.status = status;
        this.orderedAt = orderedAt;
        this.updatedAt = updatedAt;
    }

    public static PurchaseOrder create(Long itemId, String supplierName, int quantity,
                                        LocalDate desiredDeliveryDate, int purchaseUnit) {
        return create(itemId, supplierName, quantity, desiredDeliveryDate, purchaseUnit, Clock.systemDefaultZone());
    }

    public static PurchaseOrder create(Long itemId, String supplierName, int quantity,
                                        LocalDate desiredDeliveryDate, int purchaseUnit, Clock clock) {
        if (itemId == null) {
            throw new IllegalArgumentException("単品IDは必須です");
        }
        if (supplierName == null || supplierName.isBlank()) {
            throw new IllegalArgumentException("仕入先名は必須です");
        }
        if (supplierName.length() > MAX_SUPPLIER_NAME_LENGTH) {
            throw new IllegalArgumentException(
                    "仕入先名は" + MAX_SUPPLIER_NAME_LENGTH + "文字以内で入力してください");
        }
        if (quantity <= 0) {
            throw new IllegalArgumentException("数量は1以上である必要があります");
        }
        if (desiredDeliveryDate == null) {
            throw new IllegalArgumentException("希望納品日は必須です");
        }
        if (purchaseUnit > 0 && quantity % purchaseUnit != 0) {
            throw new IllegalArgumentException(
                    String.format("発注数量は購入単位（%d）の倍数である必要があります。%d → %d に切り上げますか？",
                            purchaseUnit, quantity, roundUpToUnit(quantity, purchaseUnit)));
        }

        LocalDateTime now = LocalDateTime.now(clock);
        return new PurchaseOrder(null, itemId, supplierName, quantity,
                desiredDeliveryDate, PurchaseOrderStatus.ORDERED, now, now);
    }

    public static int roundUpToUnit(int quantity, int purchaseUnit) {
        if (purchaseUnit <= 0) {
            return quantity;
        }
        return (int) Math.ceil((double) quantity / purchaseUnit) * purchaseUnit;
    }

    public void receiveAll() {
        this.status = this.status.transitionTo(PurchaseOrderStatus.RECEIVED);
        this.updatedAt = LocalDateTime.now();
    }

    public void receivePartial() {
        this.status = this.status.transitionTo(PurchaseOrderStatus.PARTIAL);
        this.updatedAt = LocalDateTime.now();
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

    public String getSupplierName() {
        return supplierName;
    }

    public int getQuantity() {
        return quantity;
    }

    public LocalDate getDesiredDeliveryDate() {
        return desiredDeliveryDate;
    }

    public PurchaseOrderStatus getStatus() {
        return status;
    }

    public LocalDateTime getOrderedAt() {
        return orderedAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
