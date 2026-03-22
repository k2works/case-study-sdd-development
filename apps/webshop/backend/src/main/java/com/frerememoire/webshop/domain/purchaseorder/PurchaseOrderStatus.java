package com.frerememoire.webshop.domain.purchaseorder;

import java.util.Map;
import java.util.Set;

public enum PurchaseOrderStatus {
    ORDERED,
    PARTIAL,
    RECEIVED;

    private static final Map<PurchaseOrderStatus, Set<PurchaseOrderStatus>> TRANSITIONS = Map.of(
            ORDERED, Set.of(PARTIAL, RECEIVED),
            PARTIAL, Set.of(PARTIAL, RECEIVED)
    );

    public PurchaseOrderStatus transitionTo(PurchaseOrderStatus next) {
        Set<PurchaseOrderStatus> allowed = TRANSITIONS.getOrDefault(this, Set.of());
        if (!allowed.contains(next)) {
            throw new IllegalStateException(
                    String.format("ステータス %s から %s への遷移はできません", this, next));
        }
        return next;
    }
}
