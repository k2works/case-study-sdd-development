package com.frerememoire.webshop.application.purchaseorder;

import com.frerememoire.webshop.domain.purchaseorder.Arrival;
import com.frerememoire.webshop.domain.purchaseorder.PurchaseOrder;
import com.frerememoire.webshop.domain.purchaseorder.PurchaseOrderStatus;
import com.frerememoire.webshop.domain.purchaseorder.port.ArrivalRepository;
import com.frerememoire.webshop.domain.purchaseorder.port.PurchaseOrderRepository;
import com.frerememoire.webshop.domain.shared.EntityNotFoundException;

import java.util.List;

public class PurchaseOrderQueryService {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final ArrivalRepository arrivalRepository;

    public PurchaseOrderQueryService(PurchaseOrderRepository purchaseOrderRepository,
                                      ArrivalRepository arrivalRepository) {
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.arrivalRepository = arrivalRepository;
    }

    public List<PurchaseOrder> findAll() {
        return purchaseOrderRepository.findAll();
    }

    public List<PurchaseOrder> findByStatus(PurchaseOrderStatus status) {
        return purchaseOrderRepository.findByStatus(status);
    }

    public PurchaseOrder findById(Long id) {
        return purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("発注", id));
    }

    public int getArrivedQuantity(Long purchaseOrderId) {
        return arrivalRepository.findByPurchaseOrderId(purchaseOrderId)
                .stream()
                .mapToInt(Arrival::getQuantity)
                .sum();
    }
}
