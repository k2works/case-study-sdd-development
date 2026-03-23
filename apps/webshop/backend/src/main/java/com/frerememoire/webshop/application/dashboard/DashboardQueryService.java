package com.frerememoire.webshop.application.dashboard;

import com.frerememoire.webshop.domain.order.Order;
import com.frerememoire.webshop.domain.order.OrderStatus;
import com.frerememoire.webshop.domain.order.port.OrderRepository;

import java.util.List;

public class DashboardQueryService {

    private final OrderRepository orderRepository;

    public DashboardQueryService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    public DashboardSummary getSummary() {
        List<Order> allOrders = orderRepository.findAll();
        long orderedCount = allOrders.stream()
                .filter(o -> o.getStatus() == OrderStatus.ORDERED).count();
        return new DashboardSummary(allOrders.size(), orderedCount);
    }
}
