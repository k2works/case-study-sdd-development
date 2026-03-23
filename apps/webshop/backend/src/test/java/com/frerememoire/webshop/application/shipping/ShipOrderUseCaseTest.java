package com.frerememoire.webshop.application.shipping;

import com.frerememoire.webshop.domain.order.DeliveryDate;
import com.frerememoire.webshop.domain.order.Message;
import com.frerememoire.webshop.domain.order.Order;
import com.frerememoire.webshop.domain.order.OrderStatus;
import com.frerememoire.webshop.domain.order.port.OrderRepository;
import com.frerememoire.webshop.domain.shared.BusinessRuleViolationException;
import com.frerememoire.webshop.domain.shared.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ShipOrderUseCaseTest {

    @Mock
    private OrderRepository orderRepository;

    private ShipOrderUseCase useCase;

    @BeforeEach
    void setUp() {
        useCase = new ShipOrderUseCase(orderRepository);
    }

    private Order createOrderWithStatus(OrderStatus status) {
        return new Order(1L, 10L, 100L, 50L,
                DeliveryDate.reconstruct(LocalDate.now().plusDays(1)),
                new Message(null),
                status, LocalDateTime.now(), LocalDateTime.now());
    }

    @Test
    void 準備中の注文を出荷済みに更新できる() {
        Order order = createOrderWithStatus(OrderStatus.PREPARING);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));

        Order result = useCase.execute(1L);

        assertThat(result.getStatus()).isEqualTo(OrderStatus.SHIPPED);
        verify(orderRepository).save(any(Order.class));
    }

    @Test
    void 存在しない注文の出荷はEntityNotFoundExceptionが発生する() {
        when(orderRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> useCase.execute(999L))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("注文");
    }

    @Test
    void 準備中以外の注文の出荷はBusinessRuleViolationExceptionが発生する() {
        Order order = createOrderWithStatus(OrderStatus.ACCEPTED);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        assertThatThrownBy(() -> useCase.execute(1L))
                .isInstanceOf(BusinessRuleViolationException.class)
                .hasMessageContaining("出荷準備中");
    }
}
