package com.frerememoire.webshop.infrastructure.persistence;

import com.frerememoire.webshop.domain.customer.DeliveryDestination;
import com.frerememoire.webshop.domain.customer.port.DeliveryDestinationRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class JpaDeliveryDestinationRepository implements DeliveryDestinationRepository {

    private final SpringDataDeliveryDestinationRepository springDataRepository;

    public JpaDeliveryDestinationRepository(SpringDataDeliveryDestinationRepository springDataRepository) {
        this.springDataRepository = springDataRepository;
    }

    @Override
    public DeliveryDestination save(DeliveryDestination destination) {
        DeliveryDestinationEntity entity = DeliveryDestinationEntity.fromDomain(destination);
        DeliveryDestinationEntity saved = springDataRepository.save(entity);
        return saved.toDomain();
    }

    @Override
    public Optional<DeliveryDestination> findById(Long id) {
        return springDataRepository.findById(id)
                .map(DeliveryDestinationEntity::toDomain);
    }

    @Override
    public List<DeliveryDestination> findByCustomerId(Long customerId) {
        return springDataRepository.findByCustomerId(customerId).stream()
                .map(DeliveryDestinationEntity::toDomain)
                .toList();
    }
}
