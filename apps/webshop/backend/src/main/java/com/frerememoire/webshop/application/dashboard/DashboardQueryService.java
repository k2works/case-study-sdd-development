package com.frerememoire.webshop.application.dashboard;

import com.frerememoire.webshop.domain.item.Item;
import com.frerememoire.webshop.domain.item.port.ItemRepository;
import com.frerememoire.webshop.domain.order.Order;
import com.frerememoire.webshop.domain.order.OrderStatus;
import com.frerememoire.webshop.domain.order.port.OrderRepository;
import com.frerememoire.webshop.domain.stock.port.InventoryQueryPort;

import java.time.Clock;
import java.time.LocalDate;
import java.util.List;

public class DashboardQueryService {

    private final OrderRepository orderRepository;
    private final ItemRepository itemRepository;
    private final InventoryQueryPort inventoryQueryPort;
    private final Clock clock;

    public DashboardQueryService(OrderRepository orderRepository,
                                  ItemRepository itemRepository,
                                  InventoryQueryPort inventoryQueryPort,
                                  Clock clock) {
        this.orderRepository = orderRepository;
        this.itemRepository = itemRepository;
        this.inventoryQueryPort = inventoryQueryPort;
        this.clock = clock;
    }

    public DashboardSummary getSummary() {
        List<Order> allOrders = orderRepository.findAll();
        long orderedCount = allOrders.stream()
                .filter(o -> o.getStatus() == OrderStatus.ORDERED).count();

        // 在庫アラート: 全品目の現在庫を確認
        List<Item> items = itemRepository.findAll();
        long outOfStockItems = 0;
        long lowStockItems = 0;
        for (Item item : items) {
            int currentStock = inventoryQueryPort.getCurrentStock(item.getId());
            if (currentStock <= 0) {
                outOfStockItems++;
            } else if (currentStock < item.getPurchaseUnit()) {
                lowStockItems++;
            }
        }

        // 本日の出荷: 結束待ち（ACCEPTED）と出荷待ち（PREPARING）
        LocalDate today = LocalDate.now(clock);
        long bundlingCount = orderRepository.findByDeliveryDateAndStatus(today, OrderStatus.ACCEPTED).size();
        long shippingCount = orderRepository.findByDeliveryDateAndStatus(today, OrderStatus.PREPARING).size();

        return new DashboardSummary(
                allOrders.size(), orderedCount,
                lowStockItems, outOfStockItems,
                bundlingCount, shippingCount);
    }
}
