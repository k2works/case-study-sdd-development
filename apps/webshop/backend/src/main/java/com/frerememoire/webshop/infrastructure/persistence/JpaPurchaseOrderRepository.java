package com.frerememoire.webshop.infrastructure.persistence;

import com.frerememoire.webshop.domain.purchaseorder.PurchaseOrder;
import com.frerememoire.webshop.domain.purchaseorder.PurchaseOrderStatus;
import com.frerememoire.webshop.domain.purchaseorder.port.PurchaseOrderRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class JpaPurchaseOrderRepository implements PurchaseOrderRepository {

    private final SpringDataPurchaseOrderRepository springDataRepository;

    public JpaPurchaseOrderRepository(SpringDataPurchaseOrderRepository springDataRepository) {
        this.springDataRepository = springDataRepository;
    }

    @Override
    public PurchaseOrder save(PurchaseOrder purchaseOrder) {
        PurchaseOrderEntity entity = PurchaseOrderEntity.fromDomain(purchaseOrder);
        PurchaseOrderEntity saved = springDataRepository.save(entity);
        return saved.toDomain();
    }

    @Override
    public Optional<PurchaseOrder> findById(Long id) {
        return springDataRepository.findById(id).map(PurchaseOrderEntity::toDomain);
    }

    @Override
    public List<PurchaseOrder> findAll() {
        return springDataRepository.findAll().stream()
                .map(PurchaseOrderEntity::toDomain)
                .toList();
    }

    @Override
    public List<PurchaseOrder> findByStatus(String status) {
        PurchaseOrderStatus poStatus = PurchaseOrderStatus.valueOf(status);
        return springDataRepository.findByStatus(poStatus).stream()
                .map(PurchaseOrderEntity::toDomain)
                .toList();
    }
}
