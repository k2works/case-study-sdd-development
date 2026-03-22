package com.frerememoire.webshop.domain.stock;

public enum StockStatus {
    AVAILABLE,
    DEGRADED,
    EXPIRED;

    public boolean isUsable() {
        return this == AVAILABLE || this == DEGRADED;
    }
}
