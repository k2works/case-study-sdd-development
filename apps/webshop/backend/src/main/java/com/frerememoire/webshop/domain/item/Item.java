package com.frerememoire.webshop.domain.item;

import java.time.LocalDateTime;

public class Item {

    private static final int MAX_NAME_LENGTH = 200;
    private static final int MAX_SUPPLIER_NAME_LENGTH = 200;

    private Long id;
    private String name;
    private int qualityRetentionDays;
    private int purchaseUnit;
    private int leadTimeDays;
    private String supplierName;
    private final LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Item(Long id, String name, int qualityRetentionDays, int purchaseUnit,
                int leadTimeDays, String supplierName,
                LocalDateTime createdAt, LocalDateTime updatedAt) {
        validateName(name);
        validatePositive(qualityRetentionDays, "品質保持日数");
        validatePositive(purchaseUnit, "発注単位");
        validatePositive(leadTimeDays, "リードタイム");
        validateSupplierName(supplierName);

        this.id = id;
        this.name = name;
        this.qualityRetentionDays = qualityRetentionDays;
        this.purchaseUnit = purchaseUnit;
        this.leadTimeDays = leadTimeDays;
        this.supplierName = supplierName;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static Item create(String name, int qualityRetentionDays, int purchaseUnit,
                               int leadTimeDays, String supplierName) {
        LocalDateTime now = LocalDateTime.now();
        return new Item(null, name, qualityRetentionDays, purchaseUnit,
                leadTimeDays, supplierName, now, now);
    }

    public void update(String name, int qualityRetentionDays, int purchaseUnit,
                       int leadTimeDays, String supplierName) {
        validateName(name);
        validatePositive(qualityRetentionDays, "品質保持日数");
        validatePositive(purchaseUnit, "発注単位");
        validatePositive(leadTimeDays, "リードタイム");
        validateSupplierName(supplierName);

        this.name = name;
        this.qualityRetentionDays = qualityRetentionDays;
        this.purchaseUnit = purchaseUnit;
        this.leadTimeDays = leadTimeDays;
        this.supplierName = supplierName;
        this.updatedAt = LocalDateTime.now();
    }

    private void validateName(String name) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("商品名は必須です");
        }
        if (name.length() > MAX_NAME_LENGTH) {
            throw new IllegalArgumentException(
                    "商品名は" + MAX_NAME_LENGTH + "文字以内で入力してください");
        }
    }

    private void validatePositive(int value, String fieldName) {
        if (value < 1) {
            throw new IllegalArgumentException(fieldName + "は1以上である必要があります");
        }
    }

    private void validateSupplierName(String supplierName) {
        if (supplierName == null || supplierName.isBlank()) {
            throw new IllegalArgumentException("仕入先名は必須です");
        }
        if (supplierName.length() > MAX_SUPPLIER_NAME_LENGTH) {
            throw new IllegalArgumentException(
                    "仕入先名は" + MAX_SUPPLIER_NAME_LENGTH + "文字以内で入力してください");
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public int getQualityRetentionDays() {
        return qualityRetentionDays;
    }

    public int getPurchaseUnit() {
        return purchaseUnit;
    }

    public int getLeadTimeDays() {
        return leadTimeDays;
    }

    public String getSupplierName() {
        return supplierName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
