package com.frerememoire.webshop.domain.customer;

import java.time.LocalDateTime;

public class DeliveryDestination {

    private Long id;
    private final Long customerId;
    private final String recipientName;
    private final String postalCode;
    private final String address;
    private final String phone;
    private final LocalDateTime createdAt;

    public DeliveryDestination(Long id, Long customerId, String recipientName,
                                String postalCode, String address, String phone,
                                LocalDateTime createdAt) {
        if (customerId == null) {
            throw new IllegalArgumentException("得意先IDは必須です");
        }
        if (recipientName == null || recipientName.isBlank()) {
            throw new IllegalArgumentException("届け先氏名は必須です");
        }
        if (postalCode == null || postalCode.isBlank()) {
            throw new IllegalArgumentException("郵便番号は必須です");
        }
        if (address == null || address.isBlank()) {
            throw new IllegalArgumentException("住所は必須です");
        }
        this.id = id;
        this.customerId = customerId;
        this.recipientName = recipientName;
        this.postalCode = postalCode;
        this.address = address;
        this.phone = phone;
        this.createdAt = createdAt;
    }

    public static DeliveryDestination create(Long customerId, String recipientName,
                                              String postalCode, String address, String phone) {
        return new DeliveryDestination(null, customerId, recipientName,
                postalCode, address, phone, LocalDateTime.now());
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public String getRecipientName() {
        return recipientName;
    }

    public String getPostalCode() {
        return postalCode;
    }

    public String getAddress() {
        return address;
    }

    public String getPhone() {
        return phone;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
