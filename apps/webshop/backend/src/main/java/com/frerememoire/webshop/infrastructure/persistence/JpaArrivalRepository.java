package com.frerememoire.webshop.infrastructure.persistence;

import com.frerememoire.webshop.domain.purchaseorder.Arrival;
import com.frerememoire.webshop.domain.purchaseorder.port.ArrivalRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class JpaArrivalRepository implements ArrivalRepository {

    private final SpringDataArrivalRepository springDataRepository;

    public JpaArrivalRepository(SpringDataArrivalRepository springDataRepository) {
        this.springDataRepository = springDataRepository;
    }

    @Override
    public Arrival save(Arrival arrival) {
        ArrivalEntity entity = ArrivalEntity.fromDomain(arrival);
        ArrivalEntity saved = springDataRepository.save(entity);
        return saved.toDomain();
    }

    @Override
    public List<Arrival> findByPurchaseOrderId(Long purchaseOrderId) {
        return springDataRepository.findByPurchaseOrderId(purchaseOrderId)
                .stream()
                .map(ArrivalEntity::toDomain)
                .toList();
    }
}
