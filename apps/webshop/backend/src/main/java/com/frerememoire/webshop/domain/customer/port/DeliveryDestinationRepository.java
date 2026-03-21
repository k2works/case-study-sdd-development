package com.frerememoire.webshop.domain.customer.port;

import com.frerememoire.webshop.domain.customer.DeliveryDestination;

import java.util.List;
import java.util.Optional;

public interface DeliveryDestinationRepository {

    DeliveryDestination save(DeliveryDestination destination);

    Optional<DeliveryDestination> findById(Long id);

    List<DeliveryDestination> findByCustomerId(Long customerId);
}
