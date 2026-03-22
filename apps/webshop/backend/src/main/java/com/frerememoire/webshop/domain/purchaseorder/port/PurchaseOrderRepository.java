package com.frerememoire.webshop.domain.purchaseorder.port;

import com.frerememoire.webshop.domain.purchaseorder.PurchaseOrder;
import com.frerememoire.webshop.domain.purchaseorder.PurchaseOrderStatus;

import java.util.List;
import java.util.Optional;

public interface PurchaseOrderRepository {

    PurchaseOrder save(PurchaseOrder purchaseOrder);

    Optional<PurchaseOrder> findById(Long id);

    List<PurchaseOrder> findAll();

    List<PurchaseOrder> findByStatus(PurchaseOrderStatus status);
}
