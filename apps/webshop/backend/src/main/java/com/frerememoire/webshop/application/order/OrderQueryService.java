package com.frerememoire.webshop.application.order;

import com.frerememoire.webshop.domain.order.Order;
import com.frerememoire.webshop.domain.order.OrderStatus;
import com.frerememoire.webshop.domain.order.port.OrderRepository;
import com.frerememoire.webshop.domain.shared.EntityNotFoundException;

import java.time.LocalDate;
import java.util.List;

public class OrderQueryService {

    private final OrderRepository orderRepository;
    private final com.frerememoire.webshop.domain.customer.port.CustomerRepository customerRepository;

    public OrderQueryService(OrderRepository orderRepository,
                              com.frerememoire.webshop.domain.customer.port.CustomerRepository customerRepository) {
        this.orderRepository = orderRepository;
        this.customerRepository = customerRepository;
    }

    public List<Order> findAll() {
        return orderRepository.findAll();
    }

    public Order findById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("受注", id));
    }

    public List<Order> findByCustomerId(Long customerId) {
        return orderRepository.findByCustomerId(customerId);
    }

    public List<Order> findByUserId(Long userId) {
        var customer = customerRepository.findByUserId(userId)
                .orElseThrow(() -> new EntityNotFoundException("得意先", userId));
        return orderRepository.findByCustomerId(customer.getId());
    }

    public List<Order> findByStatusAndDateRange(OrderStatus status, LocalDate from, LocalDate to) {
        if (status == null) {
            return orderRepository.findByDateRange(from, to);
        }
        return orderRepository.findByStatusAndDateRange(status, from, to);
    }

    public Order acceptOrder(Long orderId) {
        Order order = findById(orderId);
        order.accept();
        return orderRepository.save(order);
    }

    public List<Order> bulkAcceptOrders(List<Long> orderIds) {
        return orderIds.stream()
                .map(this::acceptOrder)
                .toList();
    }
}
