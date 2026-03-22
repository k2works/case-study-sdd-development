package com.frerememoire.webshop.application.bundling;

import com.frerememoire.webshop.domain.order.Order;
import com.frerememoire.webshop.domain.order.OrderStatus;
import com.frerememoire.webshop.domain.order.port.OrderRepository;
import com.frerememoire.webshop.domain.product.Product;
import com.frerememoire.webshop.domain.product.port.ProductRepository;
import com.frerememoire.webshop.domain.shared.BusinessRuleViolationException;
import com.frerememoire.webshop.domain.shared.EntityNotFoundException;
import com.frerememoire.webshop.domain.stock.Stock;
import com.frerememoire.webshop.domain.stock.StockConsumptionService;
import com.frerememoire.webshop.domain.stock.port.StockRepository;

import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class BundleOrderUseCase {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final StockRepository stockRepository;
    private final StockConsumptionService stockConsumptionService;

    public BundleOrderUseCase(OrderRepository orderRepository,
                               ProductRepository productRepository,
                               StockRepository stockRepository,
                               StockConsumptionService stockConsumptionService) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.stockRepository = stockRepository;
        this.stockConsumptionService = stockConsumptionService;
    }

    @Transactional
    public Order execute(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new EntityNotFoundException("注文", orderId));

        if (order.getStatus() != OrderStatus.ACCEPTED) {
            throw new BusinessRuleViolationException("結束は受付済みの注文に対してのみ実行できます");
        }

        Product product = productRepository.findById(order.getProductId())
                .orElseThrow(() -> new EntityNotFoundException("商品", order.getProductId()));

        Map<Long, Integer> requiredItems = product.getRequiredItems();

        for (Map.Entry<Long, Integer> entry : requiredItems.entrySet()) {
            Long itemId = entry.getKey();
            int requiredQty = entry.getValue();

            List<Stock> availableStocks = stockRepository.findAvailableByItemIdOrderByArrivedDate(itemId);
            Map<Stock, Integer> quantityBefore = new HashMap<>();
            availableStocks.forEach(s -> quantityBefore.put(s, s.getQuantity()));

            stockConsumptionService.consumeFifo(availableStocks, requiredQty);

            availableStocks.stream()
                    .filter(s -> s.getQuantity() != quantityBefore.get(s))
                    .forEach(stockRepository::save);
        }

        order.prepare();
        return orderRepository.save(order);
    }
}
