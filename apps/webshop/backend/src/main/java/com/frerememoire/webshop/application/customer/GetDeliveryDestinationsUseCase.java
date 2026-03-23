package com.frerememoire.webshop.application.customer;

import com.frerememoire.webshop.domain.customer.DeliveryDestination;
import com.frerememoire.webshop.domain.customer.port.DeliveryDestinationRepository;

import java.util.List;

public class GetDeliveryDestinationsUseCase {

    private final DeliveryDestinationRepository deliveryDestinationRepository;

    public GetDeliveryDestinationsUseCase(
            DeliveryDestinationRepository deliveryDestinationRepository) {
        this.deliveryDestinationRepository = deliveryDestinationRepository;
    }

    public List<DeliveryDestination> execute(Long customerId) {
        return deliveryDestinationRepository.findByCustomerId(customerId);
    }
}
