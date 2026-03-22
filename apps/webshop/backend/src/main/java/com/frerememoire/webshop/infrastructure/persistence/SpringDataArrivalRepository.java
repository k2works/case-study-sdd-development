package com.frerememoire.webshop.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SpringDataArrivalRepository extends JpaRepository<ArrivalEntity, Long> {

    List<ArrivalEntity> findByPurchaseOrderId(Long purchaseOrderId);

    @Query("SELECT COALESCE(SUM(a.quantity), 0) FROM ArrivalEntity a WHERE a.purchaseOrderId = :purchaseOrderId")
    int sumQuantityByPurchaseOrderId(@Param("purchaseOrderId") Long purchaseOrderId);
}
