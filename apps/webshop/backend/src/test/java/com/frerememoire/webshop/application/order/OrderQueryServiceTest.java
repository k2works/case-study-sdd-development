package com.frerememoire.webshop.application.order;

import com.frerememoire.webshop.domain.order.DeliveryDate;
import com.frerememoire.webshop.domain.order.Message;
import com.frerememoire.webshop.domain.order.Order;
import com.frerememoire.webshop.domain.order.OrderStatus;
import com.frerememoire.webshop.domain.order.port.OrderRepository;
import com.frerememoire.webshop.domain.shared.EntityNotFoundException;
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
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OrderQueryServiceTest {

    @Mock
    private OrderRepository orderRepository;

    private OrderQueryService service;

    @BeforeEach
    void setUp() {
        service = new OrderQueryService(orderRepository);
    }

    private Order createTestOrder(Long id, OrderStatus status) {
        LocalDate deliveryDate = LocalDate.now().plusDays(5);
        Order order = new Order(id, 1L, 1L, 1L,
                new DeliveryDate(deliveryDate),
                new Message("テスト"), status,
                LocalDateTime.now(), LocalDateTime.now());
        return order;
    }

    @Test
    void 全受注を取得できる() {
        List<Order> orders = List.of(
                createTestOrder(1L, OrderStatus.ORDERED),
                createTestOrder(2L, OrderStatus.ACCEPTED));
        when(orderRepository.findAll()).thenReturn(orders);

        List<Order> result = service.findAll();

        assertThat(result).hasSize(2);
    }

    @Test
    void IDで受注を取得できる() {
        Order order = createTestOrder(1L, OrderStatus.ORDERED);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        Order result = service.findById(1L);

        assertThat(result.getId()).isEqualTo(1L);
    }

    @Test
    void 存在しないIDの場合は例外が発生する() {
        when(orderRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.findById(99L))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("受注");
    }

    @Test
    void 得意先IDで受注を取得できる() {
        List<Order> orders = List.of(createTestOrder(1L, OrderStatus.ORDERED));
        when(orderRepository.findByCustomerId(1L)).thenReturn(orders);

        List<Order> result = service.findByCustomerId(1L);

        assertThat(result).hasSize(1);
    }

    @Test
    void 受注を受付済みに更新できる() {
        Order order = createTestOrder(1L, OrderStatus.ORDERED);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(orderRepository.save(order)).thenReturn(order);

        Order result = service.acceptOrder(1L);

        assertThat(result.getStatus()).isEqualTo(OrderStatus.ACCEPTED);
        verify(orderRepository).save(order);
    }

    @Test
    void ステータスと期間で受注を検索できる() {
        LocalDate from = LocalDate.now();
        LocalDate to = LocalDate.now().plusDays(30);
        List<Order> orders = List.of(createTestOrder(1L, OrderStatus.ORDERED));
        when(orderRepository.findByStatusAndDateRange(OrderStatus.ORDERED, from, to))
                .thenReturn(orders);

        List<Order> result = service.findByStatusAndDateRange(OrderStatus.ORDERED, from, to);

        assertThat(result).hasSize(1);
    }
}
