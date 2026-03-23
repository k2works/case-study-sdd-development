package com.frerememoire.webshop.application.customer;

import com.frerememoire.webshop.domain.auth.AuthUser;
import com.frerememoire.webshop.domain.auth.Role;
import com.frerememoire.webshop.domain.auth.UserProfile;
import com.frerememoire.webshop.domain.auth.port.AuthUserRepository;
import com.frerememoire.webshop.domain.customer.Customer;
import com.frerememoire.webshop.domain.customer.port.CustomerRepository;
import com.frerememoire.webshop.domain.order.DeliveryDate;
import com.frerememoire.webshop.domain.order.Message;
import com.frerememoire.webshop.domain.order.Order;
import com.frerememoire.webshop.domain.order.OrderStatus;
import com.frerememoire.webshop.domain.product.Product;
import com.frerememoire.webshop.domain.product.port.ProductRepository;
import com.frerememoire.webshop.domain.shared.EntityNotFoundException;
import com.frerememoire.webshop.application.order.OrderQueryService;
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
class GetCustomerDetailUseCaseTest {

    @Mock
    private CustomerRepository customerRepository;
    @Mock
    private OrderQueryService orderQueryService;
    @Mock
    private ProductRepository productRepository;
    @Mock
    private AuthUserRepository authUserRepository;

    private GetCustomerDetailUseCase useCase;

    @BeforeEach
    void setUp() {
        useCase = new GetCustomerDetailUseCase(
                customerRepository, orderQueryService, productRepository, authUserRepository);
    }

    @Test
    void 顧客IDで基本情報と注文履歴を取得できる() {
        Long customerId = 1L;
        Long userId = 10L;
        Long productId = 100L;

        Customer customer = new Customer(customerId, userId, "山田太郎", "090-1234-5678",
                LocalDateTime.of(2026, 1, 1, 0, 0), LocalDateTime.of(2026, 1, 1, 0, 0));
        when(customerRepository.findById(customerId)).thenReturn(Optional.of(customer));

        AuthUser authUser = AuthUser.create("yamada@example.com", "pass",
                Role.CUSTOMER, new UserProfile("太郎", "山田", "090-1234-5678"));
        authUser.setId(userId);
        when(authUserRepository.findById(userId)).thenReturn(Optional.of(authUser));

        Order order = new Order(1L, customerId, productId, 1L,
                DeliveryDate.reconstruct(LocalDate.of(2026, 6, 1)),
                new Message("お誕生日おめでとう"),
                OrderStatus.ORDERED,
                LocalDateTime.of(2026, 5, 1, 10, 0),
                LocalDateTime.of(2026, 5, 1, 10, 0));
        when(orderQueryService.findByCustomerId(customerId)).thenReturn(List.of(order));

        Product product = new Product(productId, "春の花束", 5000, "春の花を集めた花束",
                true, List.of(), LocalDateTime.now(), LocalDateTime.now());
        when(productRepository.findById(productId)).thenReturn(Optional.of(product));

        CustomerDetailResponse result = useCase.execute(customerId);

        assertThat(result.id()).isEqualTo(customerId);
        assertThat(result.name()).isEqualTo("山田太郎");
        assertThat(result.email()).isEqualTo("yamada@example.com");
        assertThat(result.phone()).isEqualTo("090-1234-5678");
        assertThat(result.orders()).hasSize(1);
        assertThat(result.orders().get(0).productName()).isEqualTo("春の花束");
        assertThat(result.orders().get(0).status()).isEqualTo("ORDERED");
    }

    @Test
    void 存在しない顧客IDで例外が発生する() {
        when(customerRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> useCase.execute(99L))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("得意先");
    }

    @Test
    void 注文履歴が空の場合は空リストを返す() {
        Long customerId = 1L;
        Long userId = 10L;

        Customer customer = new Customer(customerId, userId, "山田太郎", "090-1234-5678",
                LocalDateTime.of(2026, 1, 1, 0, 0), LocalDateTime.of(2026, 1, 1, 0, 0));
        when(customerRepository.findById(customerId)).thenReturn(Optional.of(customer));

        AuthUser authUser = AuthUser.create("yamada@example.com", "pass",
                Role.CUSTOMER, new UserProfile("太郎", "山田", "090-1234-5678"));
        authUser.setId(userId);
        when(authUserRepository.findById(userId)).thenReturn(Optional.of(authUser));

        when(orderQueryService.findByCustomerId(customerId)).thenReturn(List.of());

        CustomerDetailResponse result = useCase.execute(customerId);

        assertThat(result.orders()).isEmpty();
    }
}
