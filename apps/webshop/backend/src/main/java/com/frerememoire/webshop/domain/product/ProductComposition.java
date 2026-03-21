package com.frerememoire.webshop.domain.product;

public class ProductComposition {

    private Long id;
    private final Long itemId;
    private final int quantity;

    public ProductComposition(Long id, Long itemId, int quantity) {
        if (itemId == null) {
            throw new IllegalArgumentException("単品IDは必須です");
        }
        if (quantity < 1) {
            throw new IllegalArgumentException("数量は1以上である必要があります");
        }
        this.id = id;
        this.itemId = itemId;
        this.quantity = quantity;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getItemId() { return itemId; }
    public int getQuantity() { return quantity; }
}
