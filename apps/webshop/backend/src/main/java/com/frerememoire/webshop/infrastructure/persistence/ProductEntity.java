package com.frerememoire.webshop.infrastructure.persistence;

import com.frerememoire.webshop.domain.product.Product;
import com.frerememoire.webshop.domain.product.ProductComposition;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products")
public class ProductEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(nullable = false)
    private int price;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_active", nullable = false)
    private boolean isActive;

    @OneToMany(mappedBy = "productEntity", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProductCompositionEntity> compositions = new ArrayList<>();

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    protected ProductEntity() {
    }

    public static ProductEntity fromDomain(Product product) {
        ProductEntity entity = new ProductEntity();
        entity.id = product.getId();
        entity.name = product.getName();
        entity.price = product.getPrice();
        entity.description = product.getDescription();
        entity.isActive = product.isActive();
        entity.createdAt = product.getCreatedAt();
        entity.updatedAt = product.getUpdatedAt();

        entity.compositions = new ArrayList<>();
        for (ProductComposition composition : product.getCompositions()) {
            entity.compositions.add(ProductCompositionEntity.fromDomain(composition, entity));
        }

        return entity;
    }

    public Product toDomain() {
        List<ProductComposition> domainCompositions = compositions.stream()
                .map(ProductCompositionEntity::toDomain)
                .toList();
        return new Product(id, name, price, description, isActive, domainCompositions, createdAt, updatedAt);
    }
}
