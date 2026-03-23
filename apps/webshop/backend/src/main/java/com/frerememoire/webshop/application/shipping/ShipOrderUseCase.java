package com.frerememoire.webshop.application.shipping;

import com.frerememoire.webshop.domain.order.Order;
import com.frerememoire.webshop.domain.order.OrderStatus;
import com.frerememoire.webshop.domain.order.port.OrderRepository;
import com.frerememoire.webshop.domain.shared.BusinessRuleViolationException;
import com.frerememoire.webshop.domain.shared.EntityNotFoundException;

import org.springframework.transaction.annotation.Transactional;

public class ShipOrderUseCase {

    private final OrderRepository orderRepository;

    public ShipOrderUseCase(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @Transactional
    public Order execute(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new EntityNotFoundException("注文", orderId));

        if (order.getStatus() != OrderStatus.PREPARING) {
            throw new BusinessRuleViolationException("出荷は出荷準備中の注文に対してのみ実行できます");
        }

        order.ship();
        return orderRepository.save(order);
    }
}
