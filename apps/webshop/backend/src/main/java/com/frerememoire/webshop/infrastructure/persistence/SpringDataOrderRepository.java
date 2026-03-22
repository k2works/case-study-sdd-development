package com.frerememoire.webshop.infrastructure.persistence;

import com.frerememoire.webshop.domain.order.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface SpringDataOrderRepository extends JpaRepository<OrderEntity, Long> {

    List<OrderEntity> findByCustomerId(Long customerId);

    List<OrderEntity> findByStatusAndDeliveryDateBetween(OrderStatus status, LocalDate from, LocalDate to);

    List<OrderEntity> findByDeliveryDateBetween(LocalDate from, LocalDate to);

    @Query("SELECT COALESCE(SUM(pc.quantity), 0) FROM OrderEntity o "
            + "JOIN ProductCompositionEntity pc ON pc.productEntity.id = o.productId "
            + "WHERE o.deliveryDate = :date "
            + "AND o.status NOT IN ('CANCELLED', 'SHIPPED', 'DELIVERED') "
            + "AND pc.itemId = :itemId")
    int sumOrderAllocationsByItemIdAndDate(@Param("itemId") Long itemId,
                                           @Param("date") LocalDate date);
}
