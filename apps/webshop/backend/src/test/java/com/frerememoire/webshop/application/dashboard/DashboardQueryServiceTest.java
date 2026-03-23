package com.frerememoire.webshop.application.dashboard;

import com.frerememoire.webshop.domain.order.DeliveryDate;
import com.frerememoire.webshop.domain.order.Message;
import com.frerememoire.webshop.domain.order.Order;
import com.frerememoire.webshop.domain.order.OrderStatus;
import com.frerememoire.webshop.domain.order.port.OrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DashboardQueryServiceTest {

    @Mock
    private OrderRepository orderRepository;

    private DashboardQueryService service;

    @BeforeEach
    void setUp() {
        service = new DashboardQueryService(orderRepository);
    }

    private Order createTestOrder(Long id, OrderStatus status) {
        return new Order(id, 1L, 1L, 1L,
                new DeliveryDate(LocalDate.now().plusDays(5)),
                new Message("テスト"), status,
                LocalDateTime.now(), LocalDateTime.now());
    }

    @Test
    void 受注が0件の場合は全カウントが0を返す() {
        when(orderRepository.findAll()).thenReturn(Collections.emptyList());

        DashboardSummary summary = service.getSummary();

        assertThat(summary.totalOrders()).isZero();
        assertThat(summary.orderedCount()).isZero();
    }

    @Test
    void 全受注がORDEREDの場合はorderedCountがtotalOrdersと一致する() {
        when(orderRepository.findAll()).thenReturn(List.of(
                createTestOrder(1L, OrderStatus.ORDERED),
                createTestOrder(2L, OrderStatus.ORDERED),
                createTestOrder(3L, OrderStatus.ORDERED)));

        DashboardSummary summary = service.getSummary();

        assertThat(summary.totalOrders()).isEqualTo(3);
        assertThat(summary.orderedCount()).isEqualTo(3);
    }

    @Test
    void 全受注がACCEPTEDの場合はorderedCountが0を返す() {
        when(orderRepository.findAll()).thenReturn(List.of(
                createTestOrder(1L, OrderStatus.ACCEPTED),
                createTestOrder(2L, OrderStatus.ACCEPTED)));

        DashboardSummary summary = service.getSummary();

        assertThat(summary.totalOrders()).isEqualTo(2);
        assertThat(summary.orderedCount()).isZero();
    }

    @Test
    void 混在ステータスの場合は各カウントが正確に返る() {
        when(orderRepository.findAll()).thenReturn(List.of(
                createTestOrder(1L, OrderStatus.ORDERED),
                createTestOrder(2L, OrderStatus.ORDERED),
                createTestOrder(3L, OrderStatus.ACCEPTED),
                createTestOrder(4L, OrderStatus.SHIPPED),
                createTestOrder(5L, OrderStatus.DELIVERED),
                createTestOrder(6L, OrderStatus.CANCELLED)));

        DashboardSummary summary = service.getSummary();

        assertThat(summary.totalOrders()).isEqualTo(6);
        assertThat(summary.orderedCount()).isEqualTo(2);
    }

    @Test
    void ORDEREDでもACCEPTEDでもないステータスはorderedCountに含まれない() {
        when(orderRepository.findAll()).thenReturn(List.of(
                createTestOrder(1L, OrderStatus.PREPARING),
                createTestOrder(2L, OrderStatus.SHIPPED),
                createTestOrder(3L, OrderStatus.CANCELLED)));

        DashboardSummary summary = service.getSummary();

        assertThat(summary.totalOrders()).isEqualTo(3);
        assertThat(summary.orderedCount()).isZero();
    }
}
