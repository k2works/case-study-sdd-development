package com.frerememoire.webshop.application.item;

import com.frerememoire.webshop.domain.item.Item;
import com.frerememoire.webshop.domain.item.port.ItemRepository;
import com.frerememoire.webshop.domain.shared.EntityNotFoundException;

import java.util.List;

public class ItemUseCase {

    private final ItemRepository itemRepository;

    public ItemUseCase(ItemRepository itemRepository) {
        this.itemRepository = itemRepository;
    }

    public List<Item> findAll() {
        return itemRepository.findAll();
    }

    public Item findById(Long id) {
        return itemRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("単品", id));
    }

    public Item create(String name, int qualityRetentionDays, int purchaseUnit,
                       int leadTimeDays, String supplierName) {
        Item item = Item.create(name, qualityRetentionDays, purchaseUnit,
                leadTimeDays, supplierName);
        return itemRepository.save(item);
    }

    public Item update(Long id, String name, int qualityRetentionDays, int purchaseUnit,
                       int leadTimeDays, String supplierName) {
        Item item = findById(id);
        item.update(name, qualityRetentionDays, purchaseUnit, leadTimeDays, supplierName);
        return itemRepository.save(item);
    }

    public void delete(Long id) {
        if (!itemRepository.existsById(id)) {
            throw new EntityNotFoundException("単品", id);
        }
        itemRepository.deleteById(id);
    }
}
