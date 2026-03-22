package com.frerememoire.webshop.application.purchaseorder;

import com.frerememoire.webshop.domain.purchaseorder.PurchaseOrder;
import com.frerememoire.webshop.domain.purchaseorder.port.PurchaseOrderRepository;
import com.frerememoire.webshop.domain.shared.EntityNotFoundException;

import java.util.List;

public class PurchaseOrderQueryService {

    private final PurchaseOrderRepository purchaseOrderRepository;

    public PurchaseOrderQueryService(PurchaseOrderRepository purchaseOrderRepository) {
        this.purchaseOrderRepository = purchaseOrderRepository;
    }

    public List<PurchaseOrder> findAll() {
        return purchaseOrderRepository.findAll();
    }

    public List<PurchaseOrder> findByStatus(String status) {
        return purchaseOrderRepository.findByStatus(status);
    }

    public PurchaseOrder findById(Long id) {
        return purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("発注", id));
    }
}
