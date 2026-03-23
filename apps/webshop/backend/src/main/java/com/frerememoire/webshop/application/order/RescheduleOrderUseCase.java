package com.frerememoire.webshop.application.order;

import com.frerememoire.webshop.domain.order.Order;
import com.frerememoire.webshop.domain.order.port.OrderRepository;
import com.frerememoire.webshop.domain.shared.BusinessRuleViolationException;
import com.frerememoire.webshop.domain.shared.EntityNotFoundException;

import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

public class RescheduleOrderUseCase {

    private final OrderRepository orderRepository;
    private final DeliveryDateChangeValidator validator;

    public RescheduleOrderUseCase(OrderRepository orderRepository,
                                   DeliveryDateChangeValidator validator) {
        this.orderRepository = orderRepository;
        this.validator = validator;
    }

    @Transactional
    public Order execute(Long orderId, LocalDate newDeliveryDate) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new EntityNotFoundException("注文", orderId));

        if (!order.canReschedule()) {
            throw new BusinessRuleViolationException(
                    "ステータスが%sの注文は届け日を変更できません".formatted(order.getStatus().name()));
        }

        DeliveryDateChangeResult result = validator.validate(order.getProductId(), newDeliveryDate);
        if (!result.available()) {
            throw new BusinessRuleViolationException(result.reason());
        }

        order.reschedule(newDeliveryDate);
        return orderRepository.save(order);
    }

    public DeliveryDateChangeResult check(Long orderId, LocalDate targetDate) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new EntityNotFoundException("注文", orderId));

        return validator.validate(order.getProductId(), targetDate);
    }
}
