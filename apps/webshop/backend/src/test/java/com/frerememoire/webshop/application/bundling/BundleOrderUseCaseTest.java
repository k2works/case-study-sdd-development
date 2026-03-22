package com.frerememoire.webshop.application.bundling;

import com.frerememoire.webshop.domain.order.DeliveryDate;
import com.frerememoire.webshop.domain.order.Message;
import com.frerememoire.webshop.domain.order.Order;
import com.frerememoire.webshop.domain.order.OrderStatus;
import com.frerememoire.webshop.domain.order.port.OrderRepository;
import com.frerememoire.webshop.domain.product.Product;
import com.frerememoire.webshop.domain.product.port.ProductRepository;
import com.frerememoire.webshop.domain.shared.BusinessRuleViolationException;
import com.frerememoire.webshop.domain.shared.EntityNotFoundException;
import com.frerememoire.webshop.domain.stock.Stock;
import com.frerememoire.webshop.domain.stock.StockConsumptionService;
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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BundleOrderUseCaseTest {

    @Mock
    private OrderRepository orderRepository;
    @Mock
    private ProductRepository productRepository;
    @Mock
    private StockRepository stockRepository;

    private StockConsumptionService stockConsumptionService;
    private BundleOrderUseCase useCase;

    @BeforeEach
    void setUp() {
        stockConsumptionService = new StockConsumptionService();
        useCase = new BundleOrderUseCase(orderRepository, productRepository,
                stockRepository, stockConsumptionService);
    }

    @Test
    void 受付済みの注文を結束完了にできる() {
        LocalDate deliveryDate = LocalDate.now().plusDays(3);
        Order order = new Order(1L, 10L, 100L, 50L,
                DeliveryDate.reconstruct(deliveryDate),
                new Message(null),
                OrderStatus.ACCEPTED, LocalDateTime.now(), LocalDateTime.now());

        Product product = Product.create("春の花束", 5000, null);
        product.setId(100L);
        product.addComposition(1L, 3);

        Stock stock = Stock.create(1L, 10, LocalDate.of(2026, 5, 1), 14);

        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(productRepository.findById(100L)).thenReturn(Optional.of(product));
        when(stockRepository.findAvailableByItemIdOrderByArrivedDate(1L)).thenReturn(List.of(stock));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));
        when(stockRepository.save(any(Stock.class))).thenAnswer(inv -> inv.getArgument(0));

        Order result = useCase.execute(1L);

        assertThat(result.getStatus()).isEqualTo(OrderStatus.PREPARING);
        assertThat(stock.getQuantity()).isEqualTo(7);
        verify(orderRepository).save(any(Order.class));
        verify(stockRepository).save(stock);
    }

    @Test
    void 存在しない注文の場合は例外が発生する() {
        when(orderRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> useCase.execute(999L))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("注文");
    }

    @Test
    void 受付済み以外の注文の場合は例外が発生する() {
        LocalDate deliveryDate = LocalDate.now().plusDays(3);
        Order order = new Order(1L, 10L, 100L, 50L,
                DeliveryDate.reconstruct(deliveryDate),
                new Message(null),
                OrderStatus.ORDERED, LocalDateTime.now(), LocalDateTime.now());

        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        assertThatThrownBy(() -> useCase.execute(1L))
                .isInstanceOf(BusinessRuleViolationException.class)
                .hasMessageContaining("受付済み");
    }

    @Test
    void 在庫不足の場合は例外が発生する() {
        LocalDate deliveryDate = LocalDate.now().plusDays(3);
        Order order = new Order(1L, 10L, 100L, 50L,
                DeliveryDate.reconstruct(deliveryDate),
                new Message(null),
                OrderStatus.ACCEPTED, LocalDateTime.now(), LocalDateTime.now());

        Product product = Product.create("春の花束", 5000, null);
        product.setId(100L);
        product.addComposition(1L, 10);

        Stock stock = Stock.create(1L, 3, LocalDate.of(2026, 5, 1), 14);

        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(productRepository.findById(100L)).thenReturn(Optional.of(product));
        when(stockRepository.findAvailableByItemIdOrderByArrivedDate(1L)).thenReturn(List.of(stock));

        assertThatThrownBy(() -> useCase.execute(1L))
                .isInstanceOf(BusinessRuleViolationException.class)
                .hasMessageContaining("在庫が不足しています");
    }
}
