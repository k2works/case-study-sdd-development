package com.frerememoire.webshop.application.bundling;

import com.frerememoire.webshop.domain.item.Item;
import com.frerememoire.webshop.domain.item.port.ItemRepository;
import com.frerememoire.webshop.domain.order.Order;
import com.frerememoire.webshop.domain.order.OrderStatus;
import com.frerememoire.webshop.domain.order.port.OrderRepository;
import com.frerememoire.webshop.domain.product.Product;
import com.frerememoire.webshop.domain.product.port.ProductRepository;
import com.frerememoire.webshop.domain.stock.Stock;
import com.frerememoire.webshop.domain.stock.port.StockRepository;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class BundlingQueryService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final StockRepository stockRepository;
    private final ItemRepository itemRepository;

    public BundlingQueryService(OrderRepository orderRepository,
                                 ProductRepository productRepository,
                                 StockRepository stockRepository,
                                 ItemRepository itemRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.stockRepository = stockRepository;
        this.itemRepository = itemRepository;
    }

    public BundlingTargetsResult getTargets(LocalDate shippingDate) {
        List<Order> orders = orderRepository.findByDeliveryDateAndStatus(shippingDate, OrderStatus.ACCEPTED);

        if (orders.isEmpty()) {
            return new BundlingTargetsResult(shippingDate, List.of(), List.of());
        }

        List<BundlingTarget> targets = new ArrayList<>();
        Map<Long, Integer> totalRequiredByItem = new HashMap<>();

        for (Order order : orders) {
            Product product = productRepository.findById(order.getProductId())
                    .orElse(null);
            if (product == null) {
                continue;
            }

            Map<Long, Integer> requiredItems = product.getRequiredItems();
            List<RequiredItem> requiredItemList = new ArrayList<>();

            for (Map.Entry<Long, Integer> entry : requiredItems.entrySet()) {
                Long itemId = entry.getKey();
                int qty = entry.getValue();

                String itemName = itemRepository.findById(itemId)
                        .map(Item::getName)
                        .orElse("不明");

                requiredItemList.add(new RequiredItem(itemId, itemName, qty));
                totalRequiredByItem.merge(itemId, qty, Integer::sum);
            }

            targets.add(new BundlingTarget(
                    order.getId(),
                    product.getName(),
                    order.getDeliveryDateValue(),
                    order.getStatus().name(),
                    requiredItemList
            ));
        }

        List<MaterialSummary> materialSummary = new ArrayList<>();
        for (Map.Entry<Long, Integer> entry : totalRequiredByItem.entrySet()) {
            Long itemId = entry.getKey();
            int requiredQty = entry.getValue();

            String itemName = itemRepository.findById(itemId)
                    .map(Item::getName)
                    .orElse("不明");

            List<Stock> availableStocks = stockRepository.findAvailableByItemIdOrderByArrivedDate(itemId);
            int availableQty = availableStocks.stream().mapToInt(Stock::getQuantity).sum();

            int shortage = Math.max(0, requiredQty - availableQty);
            materialSummary.add(new MaterialSummary(itemId, itemName, requiredQty, availableQty, shortage));
        }

        return new BundlingTargetsResult(shippingDate, targets, materialSummary);
    }
}
