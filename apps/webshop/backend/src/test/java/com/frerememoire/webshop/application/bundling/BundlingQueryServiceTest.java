package com.frerememoire.webshop.application.bundling;

import com.frerememoire.webshop.domain.item.Item;
import com.frerememoire.webshop.domain.item.port.ItemRepository;
import com.frerememoire.webshop.domain.order.Order;
import com.frerememoire.webshop.domain.order.OrderStatus;
import com.frerememoire.webshop.domain.order.port.OrderRepository;
import com.frerememoire.webshop.domain.product.Product;
import com.frerememoire.webshop.domain.product.port.ProductRepository;
import com.frerememoire.webshop.domain.shared.EntityNotFoundException;
import com.frerememoire.webshop.domain.stock.Stock;
import com.frerememoire.webshop.domain.stock.port.StockRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BundlingQueryServiceTest {

    @Mock
    private OrderRepository orderRepository;
    @Mock
    private ProductRepository productRepository;
    @Mock
    private StockRepository stockRepository;
    @Mock
    private ItemRepository itemRepository;

    private BundlingQueryService service;

    @BeforeEach
    void setUp() {
        service = new BundlingQueryService(orderRepository, productRepository, stockRepository, itemRepository);
    }

    @Test
    void 指定日の結束対象一覧を取得できる() {
        LocalDate shippingDate = LocalDate.of(2026, 6, 1);

        Order order = new Order(1L, 10L, 100L, 50L,
                com.frerememoire.webshop.domain.order.DeliveryDate.reconstruct(shippingDate),
                new com.frerememoire.webshop.domain.order.Message("テスト"),
                OrderStatus.ACCEPTED, LocalDateTime.now(), LocalDateTime.now());

        Product product = Product.create("春の花束", 5000, "テスト");
        product.setId(100L);
        product.addComposition(1L, 3);
        product.addComposition(2L, 2);

        Item item1 = Item.create("バラ", 7, 10, 3, "花卸A");
        item1.setId(1L);
        Item item2 = Item.create("カスミソウ", 5, 10, 2, "花卸B");
        item2.setId(2L);

        Stock stock1 = Stock.create(1L, 10, LocalDate.of(2026, 5, 25), 14);
        Stock stock2 = Stock.create(2L, 5, LocalDate.of(2026, 5, 25), 14);

        when(orderRepository.findByDeliveryDateAndStatus(shippingDate, OrderStatus.ACCEPTED))
                .thenReturn(List.of(order));
        when(productRepository.findById(100L)).thenReturn(Optional.of(product));
        when(itemRepository.findById(1L)).thenReturn(Optional.of(item1));
        when(itemRepository.findById(2L)).thenReturn(Optional.of(item2));
        when(stockRepository.findAvailableByItemIdOrderByArrivedDate(1L)).thenReturn(List.of(stock1));
        when(stockRepository.findAvailableByItemIdOrderByArrivedDate(2L)).thenReturn(List.of(stock2));

        BundlingTargetsResult result = service.getTargets(shippingDate);

        assertThat(result.shippingDate()).isEqualTo(shippingDate);
        assertThat(result.targets()).hasSize(1);

        BundlingTarget target = result.targets().get(0);
        assertThat(target.orderId()).isEqualTo(1L);
        assertThat(target.productName()).isEqualTo("春の花束");
        assertThat(target.status()).isEqualTo("ACCEPTED");
        assertThat(target.requiredItems()).hasSize(2);

        assertThat(result.materialSummary()).hasSize(2);
    }

    @Test
    void 在庫不足がある場合にshortageが正しく計算される() {
        LocalDate shippingDate = LocalDate.of(2026, 6, 1);

        Order order = new Order(1L, 10L, 100L, 50L,
                com.frerememoire.webshop.domain.order.DeliveryDate.reconstruct(shippingDate),
                new com.frerememoire.webshop.domain.order.Message(null),
                OrderStatus.ACCEPTED, LocalDateTime.now(), LocalDateTime.now());

        Product product = Product.create("春の花束", 5000, null);
        product.setId(100L);
        product.addComposition(1L, 10);

        Item item1 = Item.create("バラ", 7, 10, 3, "花卸A");
        item1.setId(1L);

        Stock stock1 = Stock.create(1L, 3, LocalDate.of(2026, 5, 25), 14);

        when(orderRepository.findByDeliveryDateAndStatus(shippingDate, OrderStatus.ACCEPTED))
                .thenReturn(List.of(order));
        when(productRepository.findById(100L)).thenReturn(Optional.of(product));
        when(itemRepository.findById(1L)).thenReturn(Optional.of(item1));
        when(stockRepository.findAvailableByItemIdOrderByArrivedDate(1L)).thenReturn(List.of(stock1));

        BundlingTargetsResult result = service.getTargets(shippingDate);

        MaterialSummary summary = result.materialSummary().get(0);
        assertThat(summary.itemId()).isEqualTo(1L);
        assertThat(summary.requiredQuantity()).isEqualTo(10);
        assertThat(summary.availableStock()).isEqualTo(3);
        assertThat(summary.shortage()).isEqualTo(7);
    }

    @Test
    void 商品が存在しない注文ではEntityNotFoundExceptionが投げられる() {
        LocalDate shippingDate = LocalDate.of(2026, 6, 1);

        Order order = new Order(1L, 10L, 999L, 50L,
                com.frerememoire.webshop.domain.order.DeliveryDate.reconstruct(shippingDate),
                new com.frerememoire.webshop.domain.order.Message(null),
                OrderStatus.ACCEPTED, LocalDateTime.now(), LocalDateTime.now());

        when(orderRepository.findByDeliveryDateAndStatus(shippingDate, OrderStatus.ACCEPTED))
                .thenReturn(List.of(order));
        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getTargets(shippingDate))
                .isInstanceOf(EntityNotFoundException.class);
    }

    @Test
    void 結束対象がない場合は空の結果を返す() {
        LocalDate shippingDate = LocalDate.of(2026, 6, 1);

        when(orderRepository.findByDeliveryDateAndStatus(shippingDate, OrderStatus.ACCEPTED))
                .thenReturn(List.of());

        BundlingTargetsResult result = service.getTargets(shippingDate);

        assertThat(result.targets()).isEmpty();
        assertThat(result.materialSummary()).isEmpty();
    }
}
