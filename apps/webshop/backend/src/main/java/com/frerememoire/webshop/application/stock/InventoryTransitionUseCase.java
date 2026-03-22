package com.frerememoire.webshop.application.stock;

import com.frerememoire.webshop.domain.stock.DailyInventory;
import com.frerememoire.webshop.domain.stock.InventoryTransitionService;

import java.time.LocalDate;
import java.util.List;

public class InventoryTransitionUseCase {

    private final InventoryTransitionService transitionService;

    public InventoryTransitionUseCase(InventoryTransitionService transitionService) {
        this.transitionService = transitionService;
    }

    public List<DailyInventory> getTransition(Long itemId, LocalDate from, LocalDate to) {
        return transitionService.calculateTransition(itemId, from, to);
    }
}
