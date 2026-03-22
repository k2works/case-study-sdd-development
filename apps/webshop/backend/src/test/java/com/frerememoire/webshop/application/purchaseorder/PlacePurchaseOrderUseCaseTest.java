package com.frerememoire.webshop.application.purchaseorder;

import com.frerememoire.webshop.domain.item.Item;
import com.frerememoire.webshop.domain.item.port.ItemRepository;
import com.frerememoire.webshop.domain.purchaseorder.PurchaseOrder;
import com.frerememoire.webshop.domain.purchaseorder.PurchaseOrderStatus;
import com.frerememoire.webshop.domain.purchaseorder.port.PurchaseOrderRepository;
import com.frerememoire.webshop.domain.shared.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class PlacePurchaseOrderUseCaseTest {

    private PurchaseOrderRepository purchaseOrderRepository;
    private ItemRepository itemRepository;
    private PlacePurchaseOrderUseCase useCase;

    @BeforeEach
    void setUp() {
        purchaseOrderRepository = mock(PurchaseOrderRepository.class);
        itemRepository = mock(ItemRepository.class);
        useCase = new PlacePurchaseOrderUseCase(purchaseOrderRepository, itemRepository);
    }

    @Test
    void 発注を作成できる() {
        Item item = Item.create("バラ", 7, 10, 3, "花卸問屋A");
        item.setId(1L);
        when(itemRepository.findById(1L)).thenReturn(Optional.of(item));
        when(purchaseOrderRepository.save(any())).thenAnswer(inv -> {
            PurchaseOrder po = inv.getArgument(0);
            po.setId(1L);
            return po;
        });

        PurchaseOrder result = useCase.place(1L, 20, LocalDate.of(2026, 5, 10));

        assertThat(result.getItemId()).isEqualTo(1L);
        assertThat(result.getSupplierName()).isEqualTo("花卸問屋A");
        assertThat(result.getQuantity()).isEqualTo(20);
        assertThat(result.getStatus()).isEqualTo(PurchaseOrderStatus.ORDERED);
    }

    @Test
    void 存在しない単品で発注すると例外() {
        when(itemRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> useCase.place(99L, 10, LocalDate.of(2026, 5, 10)))
                .isInstanceOf(EntityNotFoundException.class);
    }
}
