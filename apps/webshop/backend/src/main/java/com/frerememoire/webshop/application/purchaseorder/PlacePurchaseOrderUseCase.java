package com.frerememoire.webshop.application.purchaseorder;

import com.frerememoire.webshop.domain.item.Item;
import com.frerememoire.webshop.domain.item.port.ItemRepository;
import com.frerememoire.webshop.domain.purchaseorder.PurchaseOrder;
import com.frerememoire.webshop.domain.purchaseorder.port.PurchaseOrderRepository;
import com.frerememoire.webshop.domain.shared.EntityNotFoundException;

import java.time.LocalDate;

public class PlacePurchaseOrderUseCase {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final ItemRepository itemRepository;

    public PlacePurchaseOrderUseCase(PurchaseOrderRepository purchaseOrderRepository,
                                     ItemRepository itemRepository) {
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.itemRepository = itemRepository;
    }

    public PurchaseOrder place(Long itemId, int quantity, LocalDate desiredDeliveryDate) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new EntityNotFoundException("単品", itemId));

        PurchaseOrder purchaseOrder = PurchaseOrder.create(
                itemId,
                item.getSupplierName(),
                quantity,
                desiredDeliveryDate,
                item.getPurchaseUnit());

        return purchaseOrderRepository.save(purchaseOrder);
    }
}
