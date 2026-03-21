package com.frerememoire.webshop.application.order;

import com.frerememoire.webshop.domain.customer.Customer;
import com.frerememoire.webshop.domain.customer.DeliveryDestination;
import com.frerememoire.webshop.domain.customer.port.CustomerRepository;
import com.frerememoire.webshop.domain.customer.port.DeliveryDestinationRepository;
import com.frerememoire.webshop.domain.order.Order;
import com.frerememoire.webshop.domain.order.OrderStatus;
import com.frerememoire.webshop.domain.order.port.OrderRepository;
import com.frerememoire.webshop.domain.product.port.ProductRepository;
import com.frerememoire.webshop.domain.shared.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PlaceOrderUseCaseTest {

    @Mock
    private OrderRepository orderRepository;
    @Mock
    private CustomerRepository customerRepository;
    @Mock
    private DeliveryDestinationRepository deliveryDestinationRepository;
    @Mock
    private ProductRepository productRepository;

    private PlaceOrderUseCase useCase;

    @BeforeEach
    void setUp() {
        useCase = new PlaceOrderUseCase(orderRepository, customerRepository,
                deliveryDestinationRepository, productRepository);
    }

    @Test
    void 正常に注文を作成できる() {
        Long userId = 1L;
        Long productId = 1L;
        LocalDate deliveryDate = LocalDate.now().plusDays(5);
        String recipientName = "山田花子";
        String postalCode = "123-4567";
        String address = "東京都渋谷区1-1-1";
        String phone = "090-1234-5678";
        String message = "お誕生日おめでとう";

        Customer customer = Customer.create(userId, "山田太郎", "090-0000-0000");
        customer.setId(1L);

        when(customerRepository.findByUserId(userId)).thenReturn(Optional.of(customer));
        when(productRepository.existsById(productId)).thenReturn(true);
        when(deliveryDestinationRepository.save(any(DeliveryDestination.class)))
                .thenAnswer(invocation -> {
                    DeliveryDestination dest = invocation.getArgument(0);
                    dest.setId(1L);
                    return dest;
                });
        when(orderRepository.save(any(Order.class)))
                .thenAnswer(invocation -> {
                    Order order = invocation.getArgument(0);
                    order.setId(1L);
                    return order;
                });

        PlaceOrderCommand command = new PlaceOrderCommand(
                userId, productId, deliveryDate,
                recipientName, postalCode, address, phone, message);
        Order result = useCase.placeOrder(command);

        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getCustomerId()).isEqualTo(1L);
        assertThat(result.getProductId()).isEqualTo(productId);
        assertThat(result.getStatus()).isEqualTo(OrderStatus.ORDERED);
        assertThat(result.getMessageValue()).isEqualTo(message);
    }

    @Test
    void 存在しない得意先の場合は例外が発生する() {
        when(customerRepository.findByUserId(99L)).thenReturn(Optional.empty());

        PlaceOrderCommand cmd = new PlaceOrderCommand(99L, 1L,
                LocalDate.now().plusDays(5), "氏名", "123", "住所", null, null);
        assertThatThrownBy(() -> useCase.placeOrder(cmd))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("得意先");
    }

    @Test
    void 存在しない商品の場合は例外が発生する() {
        Customer customer = Customer.create(1L, "テスト", null);
        customer.setId(1L);
        when(customerRepository.findByUserId(1L)).thenReturn(Optional.of(customer));
        when(productRepository.existsById(99L)).thenReturn(false);

        PlaceOrderCommand cmd = new PlaceOrderCommand(1L, 99L,
                LocalDate.now().plusDays(5), "氏名", "123", "住所", null, null);
        assertThatThrownBy(() -> useCase.placeOrder(cmd))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("商品");
    }
}
