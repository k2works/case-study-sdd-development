package com.frerememoire.webshop.domain.product;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class Product {

    private static final int MAX_NAME_LENGTH = 50;
    private static final int MIN_PRICE = 1;
    private static final int MAX_PRICE = 999_999;

    private Long id;
    private String name;
    private int price;
    private String description;
    private boolean active;
    private List<ProductComposition> compositions;
    private final LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Product(Long id, String name, int price, String description,
                   boolean active, List<ProductComposition> compositions,
                   LocalDateTime createdAt, LocalDateTime updatedAt) {
        validateName(name);
        validatePrice(price);

        this.id = id;
        this.name = name;
        this.price = price;
        this.description = description;
        this.active = active;
        this.compositions = compositions != null ? new ArrayList<>(compositions) : new ArrayList<>();
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static Product create(String name, int price, String description) {
        LocalDateTime now = LocalDateTime.now();
        return new Product(null, name, price, description, true, new ArrayList<>(), now, now);
    }

    public void update(String name, int price, String description) {
        validateName(name);
        validatePrice(price);

        this.name = name;
        this.price = price;
        this.description = description;
        this.updatedAt = LocalDateTime.now();
    }

    public void deactivate() {
        this.active = false;
        this.updatedAt = LocalDateTime.now();
    }

    public void activate() {
        this.active = true;
        this.updatedAt = LocalDateTime.now();
    }

    public void addComposition(Long itemId, int quantity) {
        if (itemId == null) {
            throw new IllegalArgumentException("単品IDは必須です");
        }
        if (quantity < 1) {
            throw new IllegalArgumentException("数量は1以上である必要があります");
        }
        boolean exists = compositions.stream()
                .anyMatch(c -> c.getItemId().equals(itemId));
        if (exists) {
            throw new IllegalArgumentException("この単品は既に構成に含まれています");
        }
        compositions.add(new ProductComposition(null, itemId, quantity));
        this.updatedAt = LocalDateTime.now();
    }

    public void removeComposition(Long itemId) {
        boolean removed = compositions.removeIf(c -> c.getItemId().equals(itemId));
        if (!removed) {
            throw new IllegalArgumentException("指定された単品は構成に含まれていません");
        }
        this.updatedAt = LocalDateTime.now();
    }

    public List<ProductComposition> getCompositions() {
        return List.copyOf(compositions);
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

    private void validatePrice(int price) {
        if (price < MIN_PRICE || price > MAX_PRICE) {
            throw new IllegalArgumentException(
                    "価格は" + MIN_PRICE + "〜" + MAX_PRICE + "円の範囲で設定してください");
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public int getPrice() { return price; }
    public String getDescription() { return description; }
    public boolean isActive() { return active; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
