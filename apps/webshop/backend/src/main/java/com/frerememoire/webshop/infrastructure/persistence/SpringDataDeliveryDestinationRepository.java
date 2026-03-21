package com.frerememoire.webshop.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SpringDataDeliveryDestinationRepository extends JpaRepository<DeliveryDestinationEntity, Long> {

    List<DeliveryDestinationEntity> findByCustomerId(Long customerId);
}
