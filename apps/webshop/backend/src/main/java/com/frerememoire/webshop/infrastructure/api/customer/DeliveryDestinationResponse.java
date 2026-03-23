package com.frerememoire.webshop.infrastructure.api.customer;

import com.frerememoire.webshop.domain.customer.DeliveryDestination;

public record DeliveryDestinationResponse(
        Long id,
        String recipientName,
        String postalCode,
        String address,
        String phone
) {
    public static DeliveryDestinationResponse fromDomain(DeliveryDestination destination) {
        return new DeliveryDestinationResponse(
                destination.getId(),
                destination.getRecipientName(),
                destination.getPostalCode(),
                destination.getAddress(),
                destination.getPhone()
        );
    }
}
