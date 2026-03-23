package com.frerememoire.webshop.application.order;

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
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RescheduleOrderUseCaseTest {

    @Mock
    private OrderRepository orderRepository;
    @Mock
    private DeliveryDateChangeValidator validator;

    private RescheduleOrderUseCase useCase;

    @BeforeEach
    void setUp() {
        useCase = new RescheduleOrderUseCase(orderRepository, validator);
    }

    private Order createOrderWithStatus(OrderStatus status) {
        return new Order(1L, 10L, 100L, 50L,
                DeliveryDate.reconstruct(LocalDate.now().plusDays(5)),
                new Message(null),
                status, LocalDateTime.now(), LocalDateTime.now());
    }

    @Test
    void 在庫充足時に届け日を変更できる() {
        LocalDate newDate = LocalDate.now().plusDays(10);
        Order order = createOrderWithStatus(OrderStatus.ORDERED);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(validator.validate(100L, newDate)).thenReturn(DeliveryDateChangeResult.success());
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));

        Order result = useCase.execute(1L, newDate);

        assertThat(result.getDeliveryDateValue()).isEqualTo(newDate);
        verify(orderRepository).save(any(Order.class));
    }

    @Test
    void 在庫不足時はBusinessRuleViolationExceptionが発生する() {
        LocalDate newDate = LocalDate.now().plusDays(10);
        Order order = createOrderWithStatus(OrderStatus.ORDERED);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(validator.validate(100L, newDate)).thenReturn(
                DeliveryDateChangeResult.failure("在庫不足", Map.of("バラ", 5), List.of()));

        assertThatThrownBy(() -> useCase.execute(1L, newDate))
                .isInstanceOf(BusinessRuleViolationException.class)
                .hasMessageContaining("在庫不足");
    }

    @Test
    void 準備中以降の注文は届け日変更できない() {
        LocalDate newDate = LocalDate.now().plusDays(10);
        Order order = createOrderWithStatus(OrderStatus.PREPARING);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        assertThatThrownBy(() -> useCase.execute(1L, newDate))
                .isInstanceOf(BusinessRuleViolationException.class);
    }

    @Test
    void 存在しない注文はEntityNotFoundExceptionが発生する() {
        when(orderRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> useCase.execute(999L, LocalDate.now().plusDays(10)))
                .isInstanceOf(EntityNotFoundException.class);
    }

    @Test
    void checkメソッドが在庫充足状況と代替日を返す() {
        LocalDate newDate = LocalDate.now().plusDays(10);
        Order order = createOrderWithStatus(OrderStatus.ORDERED);
        DeliveryDateChangeResult expected = DeliveryDateChangeResult.success();
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(validator.validate(100L, newDate)).thenReturn(expected);

        DeliveryDateChangeResult result = useCase.check(1L, newDate);

        assertThat(result.available()).isTrue();
    }
}
