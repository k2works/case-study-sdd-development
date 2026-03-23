package com.frerememoire.webshop.application.order;

import com.frerememoire.webshop.domain.item.Item;
import com.frerememoire.webshop.domain.item.port.ItemRepository;
import com.frerememoire.webshop.domain.product.Product;
import com.frerememoire.webshop.domain.product.port.ProductRepository;
import com.frerememoire.webshop.domain.stock.port.InventoryQueryPort;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DeliveryDateChangeValidatorTest {

    @Mock
    private ProductRepository productRepository;
    @Mock
    private InventoryQueryPort inventoryQueryPort;
    @Mock
    private ItemRepository itemRepository;

    private DeliveryDateChangeValidator validator;

    @BeforeEach
    void setUp() {
        validator = new DeliveryDateChangeValidator(productRepository, inventoryQueryPort, itemRepository);
    }

    private Product createProductWithItem(Long itemId, int qty) {
        Product product = Product.create("春の花束", 5000, null);
        product.setId(100L);
        product.addComposition(itemId, qty);
        return product;
    }

    @Test
    void 在庫が充足している場合はavailableを返す() {
        LocalDate newDate = LocalDate.now().plusDays(10);
        Product product = createProductWithItem(1L, 3);
        when(productRepository.findById(100L)).thenReturn(Optional.of(product));
        when(inventoryQueryPort.getCurrentStock(1L)).thenReturn(10);
        when(inventoryQueryPort.getExpectedArrivals(1L, newDate)).thenReturn(0);
        when(inventoryQueryPort.getOrderAllocations(1L, newDate)).thenReturn(2);
        when(inventoryQueryPort.getExpectedExpirations(1L, newDate)).thenReturn(0);

        DeliveryDateChangeResult result = validator.validate(100L, newDate);

        assertThat(result.available()).isTrue();
        assertThat(result.shortageItems()).isEmpty();
    }

    @Test
    void 在庫が不足している場合はunavailableを返す() {
        LocalDate newDate = LocalDate.now().plusDays(10);
        Product product = createProductWithItem(1L, 10);
        Item item = Item.create("バラ", 7, 10, 3, "仕入先A");
        item.setId(1L);
        when(productRepository.findById(100L)).thenReturn(Optional.of(product));
        when(inventoryQueryPort.getCurrentStock(1L)).thenReturn(5);
        when(inventoryQueryPort.getExpectedArrivals(1L, newDate)).thenReturn(0);
        when(inventoryQueryPort.getOrderAllocations(1L, newDate)).thenReturn(0);
        when(inventoryQueryPort.getExpectedExpirations(1L, newDate)).thenReturn(0);
        when(itemRepository.findById(1L)).thenReturn(Optional.of(item));

        DeliveryDateChangeResult result = validator.validate(100L, newDate);

        assertThat(result.available()).isFalse();
        assertThat(result.shortageItems()).containsEntry("バラ", 5);
    }

    @Test
    void 代替日を最大5件提案する() {
        LocalDate newDate = LocalDate.now().plusDays(10);
        Product product = createProductWithItem(1L, 3);
        Item item = Item.create("バラ", 7, 10, 3, "仕入先A");
        item.setId(1L);
        when(productRepository.findById(100L)).thenReturn(Optional.of(product));
        when(itemRepository.findById(1L)).thenReturn(Optional.of(item));

        // 指定日は在庫不足
        when(inventoryQueryPort.getCurrentStock(1L)).thenReturn(1);
        when(inventoryQueryPort.getExpectedArrivals(eq(1L), eq(newDate))).thenReturn(0);
        when(inventoryQueryPort.getOrderAllocations(eq(1L), eq(newDate))).thenReturn(0);
        when(inventoryQueryPort.getExpectedExpirations(eq(1L), eq(newDate))).thenReturn(0);

        // 前後の日付では在庫充足
        when(inventoryQueryPort.getExpectedArrivals(eq(1L), eq(newDate.plusDays(1)))).thenReturn(5);
        when(inventoryQueryPort.getOrderAllocations(eq(1L), eq(newDate.plusDays(1)))).thenReturn(0);
        when(inventoryQueryPort.getExpectedExpirations(eq(1L), eq(newDate.plusDays(1)))).thenReturn(0);

        DeliveryDateChangeResult result = validator.validate(100L, newDate);

        assertThat(result.available()).isFalse();
        assertThat(result.alternativeDates()).hasSizeLessThanOrEqualTo(5);
    }
}
