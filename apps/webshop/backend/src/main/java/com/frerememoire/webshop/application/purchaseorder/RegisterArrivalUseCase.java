package com.frerememoire.webshop.application.purchaseorder;

import com.frerememoire.webshop.domain.item.Item;
import com.frerememoire.webshop.domain.item.port.ItemRepository;
import com.frerememoire.webshop.domain.purchaseorder.Arrival;
import com.frerememoire.webshop.domain.purchaseorder.PurchaseOrder;
import com.frerememoire.webshop.domain.purchaseorder.port.ArrivalRepository;
import com.frerememoire.webshop.domain.purchaseorder.port.PurchaseOrderRepository;
import com.frerememoire.webshop.domain.shared.BusinessRuleViolationException;
import com.frerememoire.webshop.domain.shared.EntityNotFoundException;
import com.frerememoire.webshop.domain.stock.Stock;
import com.frerememoire.webshop.domain.stock.port.StockRepository;

import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

public class RegisterArrivalUseCase {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final ArrivalRepository arrivalRepository;
    private final ItemRepository itemRepository;
    private final StockRepository stockRepository;

    public RegisterArrivalUseCase(PurchaseOrderRepository purchaseOrderRepository,
                                   ArrivalRepository arrivalRepository,
                                   ItemRepository itemRepository,
                                   StockRepository stockRepository) {
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.arrivalRepository = arrivalRepository;
        this.itemRepository = itemRepository;
        this.stockRepository = stockRepository;
    }

    @Transactional
    public Arrival execute(RegisterArrivalCommand command) {
        PurchaseOrder po = purchaseOrderRepository.findById(command.purchaseOrderId())
                .orElseThrow(() -> new EntityNotFoundException("発注", command.purchaseOrderId()));

        int totalArrived = arrivalRepository.findByPurchaseOrderId(command.purchaseOrderId())
                .stream()
                .mapToInt(Arrival::getQuantity)
                .sum();

        int remaining = po.remainingQuantity(totalArrived);
        if (command.quantity() > remaining) {
            throw new BusinessRuleViolationException(
                    String.format("入荷数量(%d)が残数量(%d)を超えています", command.quantity(), remaining));
        }

        Item item = itemRepository.findById(po.getItemId())
                .orElseThrow(() -> new EntityNotFoundException("単品", po.getItemId()));

        Arrival arrival = Arrival.create(
                po.getId(),
                po.getItemId(),
                command.quantity(),
                LocalDateTime.of(command.arrivedDate(), java.time.LocalTime.MIDNIGHT));

        Arrival savedArrival = arrivalRepository.save(arrival);

        Stock stock = Stock.create(
                po.getItemId(),
                command.quantity(),
                command.arrivedDate(),
                item.getQualityRetentionDays());
        stockRepository.save(stock);

        po.registerArrival(command.quantity(), totalArrived);
        purchaseOrderRepository.save(po);

        return savedArrival;
    }
}
