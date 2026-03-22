package com.frerememoire.webshop.infrastructure.persistence;

import com.frerememoire.webshop.domain.purchaseorder.PurchaseOrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface SpringDataPurchaseOrderRepository extends JpaRepository<PurchaseOrderEntity, Long> {

    List<PurchaseOrderEntity> findByStatus(PurchaseOrderStatus status);

    @Query("SELECT COALESCE(SUM(po.quantity), 0) FROM PurchaseOrderEntity po "
            + "WHERE po.itemId = :itemId "
            + "AND po.desiredDeliveryDate = :date "
            + "AND po.status IN ('ORDERED', 'PARTIAL')")
    int sumExpectedArrivalsByItemIdAndDate(@Param("itemId") Long itemId,
                                           @Param("date") LocalDate date);
}
