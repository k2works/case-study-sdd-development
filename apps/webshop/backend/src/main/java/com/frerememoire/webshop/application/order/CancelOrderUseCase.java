package com.frerememoire.webshop.application.order;

import com.frerememoire.webshop.domain.order.Order;
import com.frerememoire.webshop.domain.order.port.OrderRepository;
import com.frerememoire.webshop.domain.shared.BusinessRuleViolationException;
import com.frerememoire.webshop.domain.shared.EntityNotFoundException;

import org.springframework.transaction.annotation.Transactional;

public class CancelOrderUseCase {

    private final OrderRepository orderRepository;

    public CancelOrderUseCase(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @Transactional
    public Order execute(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new EntityNotFoundException("注文", orderId));

        if (!order.canCancel()) {
            throw new BusinessRuleViolationException(
                    "ステータスが%sの注文はキャンセルできません".formatted(order.getStatus().name()));
        }

        order.cancel();
        return orderRepository.save(order);
    }
}
