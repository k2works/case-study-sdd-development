package com.frerememoire.webshop.infrastructure.persistence;

import com.frerememoire.webshop.domain.stock.port.InventoryQueryPort;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class JpaInventoryQueryPort implements InventoryQueryPort {

    private final SpringDataStockRepository stockRepository;
    private final SpringDataOrderRepository orderRepository;

    public JpaInventoryQueryPort(SpringDataStockRepository stockRepository,
                                  SpringDataOrderRepository orderRepository) {
        this.stockRepository = stockRepository;
        this.orderRepository = orderRepository;
    }

    @Override
    public int getCurrentStock(Long itemId) {
        return stockRepository.sumAvailableQuantityByItemId(itemId);
    }

    @Override
    public int getExpectedArrivals(Long itemId, LocalDate date) {
        // IT5 で入荷機能実装後に接続。現在は 0 を返す
        return 0;
    }

    @Override
    public int getOrderAllocations(Long itemId, LocalDate date) {
        // 受注の届け日に基づく引当数を返す
        // 商品構成から単品数量を算出する必要があるため、簡易実装
        return 0;
    }

    @Override
    public int getExpectedExpirations(Long itemId, LocalDate date) {
        return stockRepository.sumExpiringQuantityByItemIdAndDate(itemId, date);
    }
}
