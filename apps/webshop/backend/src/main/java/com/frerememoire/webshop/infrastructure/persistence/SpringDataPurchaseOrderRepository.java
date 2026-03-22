package com.frerememoire.webshop.infrastructure.persistence;

import com.frerememoire.webshop.domain.purchaseorder.PurchaseOrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SpringDataPurchaseOrderRepository extends JpaRepository<PurchaseOrderEntity, Long> {

    List<PurchaseOrderEntity> findByStatus(PurchaseOrderStatus status);
}
