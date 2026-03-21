package com.frerememoire.webshop.infrastructure.persistence;

import com.frerememoire.webshop.domain.product.ProductComposition;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "product_compositions")
public class ProductCompositionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private ProductEntity productEntity;

    @Column(name = "item_id", nullable = false)
    private Long itemId;

    @Column(nullable = false)
    private int quantity;

    protected ProductCompositionEntity() {
    }

    public static ProductCompositionEntity fromDomain(ProductComposition composition, ProductEntity productEntity) {
        ProductCompositionEntity entity = new ProductCompositionEntity();
        entity.id = composition.getId();
        entity.productEntity = productEntity;
        entity.itemId = composition.getItemId();
        entity.quantity = composition.getQuantity();
        return entity;
    }

    public ProductComposition toDomain() {
        return new ProductComposition(id, itemId, quantity);
    }

    public Long getId() { return id; }
    public ProductEntity getProductEntity() { return productEntity; }
    public Long getItemId() { return itemId; }
    public int getQuantity() { return quantity; }
}
