package com.frerememoire.webshop.application.purchaseorder;

import com.frerememoire.webshop.domain.item.Item;
import com.frerememoire.webshop.domain.item.port.ItemRepository;
import com.frerememoire.webshop.domain.purchaseorder.Arrival;
import com.frerememoire.webshop.domain.purchaseorder.PurchaseOrder;
import com.frerememoire.webshop.domain.purchaseorder.PurchaseOrderStatus;
import com.frerememoire.webshop.domain.purchaseorder.port.ArrivalRepository;
import com.frerememoire.webshop.domain.purchaseorder.port.PurchaseOrderRepository;
import com.frerememoire.webshop.domain.shared.BusinessRuleViolationException;
import com.frerememoire.webshop.domain.shared.EntityNotFoundException;
import com.frerememoire.webshop.domain.stock.Stock;
import com.frerememoire.webshop.domain.stock.port.StockRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class RegisterArrivalUseCaseTest {

    private PurchaseOrderRepository purchaseOrderRepository;
    private ArrivalRepository arrivalRepository;
    private ItemRepository itemRepository;
    private StockRepository stockRepository;
    private RegisterArrivalUseCase useCase;

    @BeforeEach
    void setUp() {
        purchaseOrderRepository = mock(PurchaseOrderRepository.class);
        arrivalRepository = mock(ArrivalRepository.class);
        itemRepository = mock(ItemRepository.class);
        stockRepository = mock(StockRepository.class);
        useCase = new RegisterArrivalUseCase(
                purchaseOrderRepository, arrivalRepository, itemRepository, stockRepository);
    }

    @Test
    void 入荷を登録できる() {
        PurchaseOrder po = new PurchaseOrder(1L, 10L, "花卸問屋A", 20,
                LocalDate.of(2026, 5, 10), PurchaseOrderStatus.ORDERED,
                LocalDateTime.now(), LocalDateTime.now());
        Item item = new Item(10L, "バラ", 7, 10, 3, "花卸問屋A",
                LocalDateTime.now(), LocalDateTime.now());

        when(purchaseOrderRepository.findById(1L)).thenReturn(Optional.of(po));
        when(arrivalRepository.findByPurchaseOrderId(1L)).thenReturn(List.of());
        when(itemRepository.findById(10L)).thenReturn(Optional.of(item));
        when(arrivalRepository.save(any())).thenAnswer(inv -> {
            Arrival a = inv.getArgument(0);
            a.setId(1L);
            return a;
        });
        when(stockRepository.save(any())).thenAnswer(inv -> {
            Stock s = inv.getArgument(0);
            s.setId(1L);
            return s;
        });
        when(purchaseOrderRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        RegisterArrivalCommand command = new RegisterArrivalCommand(1L, 10, LocalDate.of(2026, 4, 1));
        Arrival result = useCase.execute(command);

        assertThat(result.getQuantity()).isEqualTo(10);
        assertThat(result.getPurchaseOrderId()).isEqualTo(1L);
        assertThat(result.getItemId()).isEqualTo(10L);

        verify(stockRepository).save(any(Stock.class));
        verify(purchaseOrderRepository).save(any(PurchaseOrder.class));
    }

    @Test
    void 全数入荷するとRECEIVEDになる() {
        PurchaseOrder po = new PurchaseOrder(1L, 10L, "花卸問屋A", 20,
                LocalDate.of(2026, 5, 10), PurchaseOrderStatus.ORDERED,
                LocalDateTime.now(), LocalDateTime.now());
        Item item = new Item(10L, "バラ", 7, 10, 3, "花卸問屋A",
                LocalDateTime.now(), LocalDateTime.now());

        when(purchaseOrderRepository.findById(1L)).thenReturn(Optional.of(po));
        when(arrivalRepository.findByPurchaseOrderId(1L)).thenReturn(List.of());
        when(itemRepository.findById(10L)).thenReturn(Optional.of(item));
        when(arrivalRepository.save(any())).thenAnswer(inv -> {
            Arrival a = inv.getArgument(0);
            a.setId(1L);
            return a;
        });
        when(stockRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(purchaseOrderRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        RegisterArrivalCommand command = new RegisterArrivalCommand(1L, 20, LocalDate.of(2026, 4, 1));
        useCase.execute(command);

        assertThat(po.getStatus()).isEqualTo(PurchaseOrderStatus.RECEIVED);
    }

    @Test
    void 一部入荷するとPARTIALになる() {
        PurchaseOrder po = new PurchaseOrder(1L, 10L, "花卸問屋A", 20,
                LocalDate.of(2026, 5, 10), PurchaseOrderStatus.ORDERED,
                LocalDateTime.now(), LocalDateTime.now());
        Item item = new Item(10L, "バラ", 7, 10, 3, "花卸問屋A",
                LocalDateTime.now(), LocalDateTime.now());

        when(purchaseOrderRepository.findById(1L)).thenReturn(Optional.of(po));
        when(arrivalRepository.findByPurchaseOrderId(1L)).thenReturn(List.of());
        when(itemRepository.findById(10L)).thenReturn(Optional.of(item));
        when(arrivalRepository.save(any())).thenAnswer(inv -> {
            Arrival a = inv.getArgument(0);
            a.setId(1L);
            return a;
        });
        when(stockRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(purchaseOrderRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        RegisterArrivalCommand command = new RegisterArrivalCommand(1L, 5, LocalDate.of(2026, 4, 1));
        useCase.execute(command);

        assertThat(po.getStatus()).isEqualTo(PurchaseOrderStatus.PARTIAL);
    }

    @Test
    void 存在しない発注で入荷登録すると例外() {
        when(purchaseOrderRepository.findById(99L)).thenReturn(Optional.empty());

        RegisterArrivalCommand command = new RegisterArrivalCommand(99L, 10, LocalDate.of(2026, 4, 1));

        assertThatThrownBy(() -> useCase.execute(command))
                .isInstanceOf(EntityNotFoundException.class);
    }

    @Test
    void RECEIVED状態の発注には入荷登録できない() {
        PurchaseOrder po = new PurchaseOrder(1L, 10L, "花卸問屋A", 20,
                LocalDate.of(2026, 5, 10), PurchaseOrderStatus.RECEIVED,
                LocalDateTime.now(), LocalDateTime.now());

        Arrival existingArrival = new Arrival(1L, 1L, 10L, 20, LocalDateTime.now());

        when(purchaseOrderRepository.findById(1L)).thenReturn(Optional.of(po));
        when(arrivalRepository.findByPurchaseOrderId(1L)).thenReturn(List.of(existingArrival));

        RegisterArrivalCommand command = new RegisterArrivalCommand(1L, 1, LocalDate.of(2026, 4, 1));

        assertThatThrownBy(() -> useCase.execute(command))
                .isInstanceOf(BusinessRuleViolationException.class)
                .hasMessageContaining("残数量");
    }

    @Test
    void 入荷数量が残数量を超過すると例外() {
        PurchaseOrder po = new PurchaseOrder(1L, 10L, "花卸問屋A", 20,
                LocalDate.of(2026, 5, 10), PurchaseOrderStatus.ORDERED,
                LocalDateTime.now(), LocalDateTime.now());

        Arrival existingArrival = new Arrival(1L, 1L, 10L, 15, LocalDateTime.now());

        when(purchaseOrderRepository.findById(1L)).thenReturn(Optional.of(po));
        when(arrivalRepository.findByPurchaseOrderId(1L)).thenReturn(List.of(existingArrival));

        RegisterArrivalCommand command = new RegisterArrivalCommand(1L, 10, LocalDate.of(2026, 4, 1));

        assertThatThrownBy(() -> useCase.execute(command))
                .isInstanceOf(BusinessRuleViolationException.class)
                .hasMessageContaining("残数量");
    }
}
