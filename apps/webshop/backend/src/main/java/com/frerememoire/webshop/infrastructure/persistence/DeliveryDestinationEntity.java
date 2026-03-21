package com.frerememoire.webshop.infrastructure.persistence;

import com.frerememoire.webshop.domain.customer.DeliveryDestination;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "delivery_destinations")
public class DeliveryDestinationEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "customer_id", nullable = false)
    private Long customerId;

    @Column(name = "recipient_name", nullable = false, length = 100)
    private String recipientName;

    @Column(name = "postal_code", nullable = false, length = 10)
    private String postalCode;

    @Column(nullable = false, length = 500)
    private String address;

    @Column(length = 20)
    private String phone;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    protected DeliveryDestinationEntity() {
    }

    public static DeliveryDestinationEntity fromDomain(DeliveryDestination dest) {
        DeliveryDestinationEntity entity = new DeliveryDestinationEntity();
        entity.id = dest.getId();
        entity.customerId = dest.getCustomerId();
        entity.recipientName = dest.getRecipientName();
        entity.postalCode = dest.getPostalCode();
        entity.address = dest.getAddress();
        entity.phone = dest.getPhone();
        entity.createdAt = dest.getCreatedAt();
        return entity;
    }

    public DeliveryDestination toDomain() {
        return new DeliveryDestination(id, customerId, recipientName,
                postalCode, address, phone, createdAt);
    }
}
