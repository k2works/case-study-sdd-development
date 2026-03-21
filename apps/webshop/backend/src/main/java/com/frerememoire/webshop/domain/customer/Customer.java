package com.frerememoire.webshop.domain.customer;

import java.time.LocalDateTime;

public class Customer {

    private Long id;
    private final Long userId;
    private final String name;
    private final String phone;
    private final LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Customer(Long id, Long userId, String name, String phone,
                    LocalDateTime createdAt, LocalDateTime updatedAt) {
        if (userId == null) {
            throw new IllegalArgumentException("ユーザーIDは必須です");
        }
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("得意先名は必須です");
        }
        this.id = id;
        this.userId = userId;
        this.name = name;
        this.phone = phone;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static Customer create(Long userId, String name, String phone) {
        LocalDateTime now = LocalDateTime.now();
        return new Customer(null, userId, name, phone, now, now);
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public String getName() {
        return name;
    }

    public String getPhone() {
        return phone;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
