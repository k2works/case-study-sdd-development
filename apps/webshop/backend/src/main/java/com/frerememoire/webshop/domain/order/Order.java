package com.frerememoire.webshop.domain.order;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class Order {

    private Long id;
    private final Long customerId;
    private final Long productId;
    private final Long deliveryDestinationId;
    private final DeliveryDate deliveryDate;
    private final Message message;
    private OrderStatus status;
    private final LocalDateTime orderedAt;
    private LocalDateTime updatedAt;

    public Order(Long id, Long customerId, Long productId, Long deliveryDestinationId,
                 DeliveryDate deliveryDate, Message message, OrderStatus status,
                 LocalDateTime orderedAt, LocalDateTime updatedAt) {
        if (customerId == null) {
            throw new IllegalArgumentException("得意先IDは必須です");
        }
        if (productId == null) {
            throw new IllegalArgumentException("商品IDは必須です");
        }
        if (deliveryDestinationId == null) {
            throw new IllegalArgumentException("届け先IDは必須です");
        }
        if (deliveryDate == null) {
            throw new IllegalArgumentException("届け日は必須です");
        }
        if (status == null) {
            throw new IllegalArgumentException("ステータスは必須です");
        }
        this.id = id;
        this.customerId = customerId;
        this.productId = productId;
        this.deliveryDestinationId = deliveryDestinationId;
        this.deliveryDate = deliveryDate;
        this.message = message != null ? message : new Message(null);
        this.status = status;
        this.orderedAt = orderedAt;
        this.updatedAt = updatedAt;
    }

    public static Order create(Long customerId, Long productId, Long deliveryDestinationId,
                                LocalDate deliveryDateValue, String messageValue) {
        LocalDateTime now = LocalDateTime.now();
        return new Order(null, customerId, productId, deliveryDestinationId,
                new DeliveryDate(deliveryDateValue),
                new Message(messageValue),
                OrderStatus.ORDERED, now, now);
    }

    public void accept() {
        this.status = this.status.transitionTo(OrderStatus.ACCEPTED);
        this.updatedAt = LocalDateTime.now();
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

    public Long getProductId() {
        return productId;
    }

    public Long getDeliveryDestinationId() {
        return deliveryDestinationId;
    }

    public DeliveryDate getDeliveryDate() {
        return deliveryDate;
    }

    public LocalDate getDeliveryDateValue() {
        return deliveryDate.getValue();
    }

    public Message getMessage() {
        return message;
    }

    public String getMessageValue() {
        return message.getValue();
    }

    public OrderStatus getStatus() {
        return status;
    }

    public LocalDateTime getOrderedAt() {
        return orderedAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
