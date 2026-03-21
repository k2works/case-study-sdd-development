package com.frerememoire.webshop.domain.order;

import java.util.Set;

public enum OrderStatus {
    ORDERED,
    ACCEPTED,
    PREPARING,
    SHIPPED,
    DELIVERED,
    CANCELLED;

    public boolean canTransitionTo(OrderStatus next) {
        return getAllowedTransitions().contains(next);
    }

    public OrderStatus transitionTo(OrderStatus next) {
        if (!canTransitionTo(next)) {
            throw new IllegalStateException(
                    "ステータスを %s から %s に変更できません".formatted(this.name(), next.name()));
        }
        return next;
    }

    private Set<OrderStatus> getAllowedTransitions() {
        return switch (this) {
            case ORDERED -> Set.of(ACCEPTED, CANCELLED);
            case ACCEPTED -> Set.of(PREPARING, CANCELLED);
            case PREPARING -> Set.of(SHIPPED, CANCELLED);
            case SHIPPED -> Set.of(DELIVERED);
            case DELIVERED -> Set.of();
            case CANCELLED -> Set.of();
        };
    }
}
