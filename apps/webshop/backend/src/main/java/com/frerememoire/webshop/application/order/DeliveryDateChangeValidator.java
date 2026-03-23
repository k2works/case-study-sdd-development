package com.frerememoire.webshop.application.order;

import com.frerememoire.webshop.domain.item.Item;
import com.frerememoire.webshop.domain.item.port.ItemRepository;
import com.frerememoire.webshop.domain.product.Product;
import com.frerememoire.webshop.domain.product.port.ProductRepository;
import com.frerememoire.webshop.domain.shared.EntityNotFoundException;
import com.frerememoire.webshop.domain.stock.port.InventoryQueryPort;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class DeliveryDateChangeValidator {

    private static final int MAX_ALTERNATIVE_DATES = 5;
    private static final int SEARCH_RANGE_DAYS = 14;

    private final ProductRepository productRepository;
    private final InventoryQueryPort inventoryQueryPort;
    private final ItemRepository itemRepository;

    public DeliveryDateChangeValidator(ProductRepository productRepository,
                                        InventoryQueryPort inventoryQueryPort,
                                        ItemRepository itemRepository) {
        this.productRepository = productRepository;
        this.inventoryQueryPort = inventoryQueryPort;
        this.itemRepository = itemRepository;
    }

    public DeliveryDateChangeResult validate(Long productId, LocalDate targetDate) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new EntityNotFoundException("商品", productId));

        Map<Long, Integer> requiredItems = product.getRequiredItems();
        Map<String, Integer> shortageItems = checkShortage(requiredItems, targetDate);

        if (shortageItems.isEmpty()) {
            return DeliveryDateChangeResult.success();
        }

        List<LocalDate> alternativeDates = findAlternativeDates(requiredItems, targetDate);
        String reason = buildShortageReason(shortageItems);

        return DeliveryDateChangeResult.failure(reason, shortageItems, alternativeDates);
    }

    private Map<String, Integer> checkShortage(Map<Long, Integer> requiredItems, LocalDate date) {
        Map<String, Integer> shortage = new LinkedHashMap<>();

        for (Map.Entry<Long, Integer> entry : requiredItems.entrySet()) {
            Long itemId = entry.getKey();
            int required = entry.getValue();
            int available = calculateAvailable(itemId, date);

            if (available < required) {
                String itemName = itemRepository.findById(itemId)
                        .map(Item::getName).orElse("不明");
                shortage.put(itemName, required - available);
            }
        }

        return shortage;
    }

    private int calculateAvailable(Long itemId, LocalDate date) {
        int currentStock = inventoryQueryPort.getCurrentStock(itemId);
        int arrivals = inventoryQueryPort.getExpectedArrivals(itemId, date);
        int allocations = inventoryQueryPort.getOrderAllocations(itemId, date);
        int expirations = inventoryQueryPort.getExpectedExpirations(itemId, date);

        return currentStock + arrivals - allocations - expirations;
    }

    private List<LocalDate> findAlternativeDates(Map<Long, Integer> requiredItems, LocalDate targetDate) {
        List<LocalDate> alternatives = new ArrayList<>();
        LocalDate today = LocalDate.now();

        for (int offset = 1; offset <= SEARCH_RANGE_DAYS && alternatives.size() < MAX_ALTERNATIVE_DATES; offset++) {
            LocalDate candidate = targetDate.plusDays(offset);
            if (candidate.isAfter(today.plusDays(30))) {
                break;
            }
            if (candidate.isBefore(today.plusDays(1))) {
                continue;
            }
            if (isAvailable(requiredItems, candidate)) {
                alternatives.add(candidate);
            }
        }

        // 前方も探索
        for (int offset = 1; offset <= SEARCH_RANGE_DAYS && alternatives.size() < MAX_ALTERNATIVE_DATES; offset++) {
            LocalDate candidate = targetDate.minusDays(offset);
            if (candidate.isBefore(today.plusDays(1))) {
                break;
            }
            if (isAvailable(requiredItems, candidate)) {
                alternatives.add(candidate);
            }
        }

        return alternatives;
    }

    private boolean isAvailable(Map<Long, Integer> requiredItems, LocalDate date) {
        for (Map.Entry<Long, Integer> entry : requiredItems.entrySet()) {
            Long itemId = entry.getKey();
            int required = entry.getValue();
            int available = calculateAvailable(itemId, date);
            if (available < required) {
                return false;
            }
        }
        return true;
    }

    private String buildShortageReason(Map<String, Integer> shortageItems) {
        StringBuilder sb = new StringBuilder("在庫が不足しています: ");
        shortageItems.forEach((name, qty) ->
                sb.append(name).append("（").append(qty).append("本不足）、"));
        return sb.substring(0, sb.length() - 1);
    }
}
