package com.frerememoire.webshop.domain.order.port;

import com.frerememoire.webshop.domain.order.Order;
import com.frerememoire.webshop.domain.order.OrderStatus;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface OrderRepository {

    Order save(Order order);

    Optional<Order> findById(Long id);

    List<Order> findByCustomerId(Long customerId);

    List<Order> findAll();

    List<Order> findByStatusAndDateRange(OrderStatus status, LocalDate from, LocalDate to);

    List<Order> findByDateRange(LocalDate from, LocalDate to);
}
