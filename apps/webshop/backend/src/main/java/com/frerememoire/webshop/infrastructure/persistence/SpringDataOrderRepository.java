package com.frerememoire.webshop.infrastructure.persistence;

import com.frerememoire.webshop.domain.order.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface SpringDataOrderRepository extends JpaRepository<OrderEntity, Long> {

    List<OrderEntity> findByCustomerId(Long customerId);

    List<OrderEntity> findByStatusAndDeliveryDateBetween(OrderStatus status, LocalDate from, LocalDate to);

    List<OrderEntity> findByDeliveryDateBetween(LocalDate from, LocalDate to);
}
