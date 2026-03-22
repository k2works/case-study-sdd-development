package com.frerememoire.webshop.infrastructure.persistence;

import com.frerememoire.webshop.domain.stock.port.InventoryQueryPort;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class JpaInventoryQueryPort implements InventoryQueryPort {

    private final SpringDataStockRepository stockRepository;
    private final SpringDataOrderRepository orderRepository;
    private final SpringDataPurchaseOrderRepository purchaseOrderRepository;

    public JpaInventoryQueryPort(SpringDataStockRepository stockRepository,
                                  SpringDataOrderRepository orderRepository,
                                  SpringDataPurchaseOrderRepository purchaseOrderRepository) {
        this.stockRepository = stockRepository;
        this.orderRepository = orderRepository;
        this.purchaseOrderRepository = purchaseOrderRepository;
    }

    @Override
    public int getCurrentStock(Long itemId) {
        return stockRepository.sumAvailableQuantityByItemId(itemId);
    }

    @Override
    public int getExpectedArrivals(Long itemId, LocalDate date) {
        return purchaseOrderRepository.sumExpectedArrivalsByItemIdAndDate(itemId, date);
    }

    @Override
    public int getOrderAllocations(Long itemId, LocalDate date) {
        return orderRepository.sumOrderAllocationsByItemIdAndDate(itemId, date);
    }

    @Override
    public int getExpectedExpirations(Long itemId, LocalDate date) {
        return stockRepository.sumExpiringQuantityByItemIdAndDate(itemId, date);
    }
}
