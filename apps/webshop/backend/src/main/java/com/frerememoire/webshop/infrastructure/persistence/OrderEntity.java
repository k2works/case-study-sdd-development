package com.frerememoire.webshop.infrastructure.persistence;

import com.frerememoire.webshop.domain.order.DeliveryDate;
import com.frerememoire.webshop.domain.order.Message;
import com.frerememoire.webshop.domain.order.Order;
import com.frerememoire.webshop.domain.order.OrderStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
public class OrderEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "customer_id", nullable = false)
    private Long customerId;

    @Column(name = "product_id", nullable = false)
    private Long productId;

    @Column(name = "delivery_destination_id", nullable = false)
    private Long deliveryDestinationId;

    @Column(name = "delivery_date", nullable = false)
    private LocalDate deliveryDate;

    @Column(length = 200)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private OrderStatus status;

    @Column(name = "ordered_at", nullable = false)
    private LocalDateTime orderedAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    protected OrderEntity() {
    }

    public static OrderEntity fromDomain(Order order) {
        OrderEntity entity = new OrderEntity();
        entity.id = order.getId();
        entity.customerId = order.getCustomerId();
        entity.productId = order.getProductId();
        entity.deliveryDestinationId = order.getDeliveryDestinationId();
        entity.deliveryDate = order.getDeliveryDateValue();
        entity.message = order.getMessageValue();
        entity.status = order.getStatus();
        entity.orderedAt = order.getOrderedAt();
        entity.updatedAt = order.getUpdatedAt();
        return entity;
    }

    public Order toDomain() {
        return new Order(id, customerId, productId, deliveryDestinationId,
                DeliveryDate.reconstruct(deliveryDate),
                new Message(message),
                status, orderedAt, updatedAt);
    }
}
