package com.frerememoire.webshop.domain.stock;

import com.frerememoire.webshop.domain.shared.BusinessRuleViolationException;

import java.util.List;

public class StockConsumptionService {

    public void consumeFifo(List<Stock> availableStocks, int requiredQuantity) {
        int totalAvailable = availableStocks.stream().mapToInt(Stock::getQuantity).sum();
        if (totalAvailable < requiredQuantity) {
            throw new BusinessRuleViolationException("在庫が不足しています（必要: %d、在庫: %d）"
                    .formatted(requiredQuantity, totalAvailable));
        }

        int remaining = requiredQuantity;
        for (Stock stock : availableStocks) {
            if (remaining <= 0) {
                break;
            }
            int consumeQty = Math.min(remaining, stock.getQuantity());
            stock.consume(consumeQty);
            remaining -= consumeQty;
        }
    }
}
