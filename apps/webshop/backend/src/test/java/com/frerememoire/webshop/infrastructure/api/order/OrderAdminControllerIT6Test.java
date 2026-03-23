package com.frerememoire.webshop.infrastructure.api.order;

import com.frerememoire.webshop.application.order.CancelOrderUseCase;
import com.frerememoire.webshop.application.order.DeliveryDateChangeResult;
import com.frerememoire.webshop.application.order.OrderQueryService;
import com.frerememoire.webshop.application.order.RescheduleOrderUseCase;
import com.frerememoire.webshop.application.shipping.ShipOrderUseCase;
import com.frerememoire.webshop.domain.customer.Customer;
import com.frerememoire.webshop.domain.customer.port.CustomerRepository;
import com.frerememoire.webshop.domain.customer.port.DeliveryDestinationRepository;
import com.frerememoire.webshop.domain.order.DeliveryDate;
import com.frerememoire.webshop.domain.order.Message;
import com.frerememoire.webshop.domain.order.Order;
import com.frerememoire.webshop.domain.order.OrderStatus;
import com.frerememoire.webshop.domain.product.Product;
import com.frerememoire.webshop.domain.product.port.ProductRepository;
import com.frerememoire.webshop.domain.shared.BusinessRuleViolationException;
import com.frerememoire.webshop.domain.shared.EntityNotFoundException;
import com.frerememoire.webshop.infrastructure.security.JwtAuthenticationFilter;
import com.frerememoire.webshop.infrastructure.security.JwtTokenProvider;
import com.frerememoire.webshop.infrastructure.security.SecurityConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(OrderAdminController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
class OrderAdminControllerIT6Test {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private OrderQueryService orderQueryService;
    @MockitoBean
    private ShipOrderUseCase shipOrderUseCase;
    @MockitoBean
    private CancelOrderUseCase cancelOrderUseCase;
    @MockitoBean
    private RescheduleOrderUseCase rescheduleOrderUseCase;
    @MockitoBean
    private ProductRepository productRepository;
    @MockitoBean
    private CustomerRepository customerRepository;
    @MockitoBean
    private DeliveryDestinationRepository deliveryDestinationRepository;
    @MockitoBean
    private JwtTokenProvider jwtTokenProvider;

    private Order createOrder(OrderStatus status) {
        return new Order(1L, 10L, 100L, 50L,
                DeliveryDate.reconstruct(LocalDate.of(2026, 6, 1)),
                new Message(null),
                status, LocalDateTime.now(), LocalDateTime.now());
    }

    private void setupProductAndCustomer() {
        Product product = Product.create("春の花束", 5000, null);
        product.setId(100L);
        when(productRepository.findById(100L)).thenReturn(Optional.of(product));
        Customer customer = Customer.create(1L, "山田太郎", "090-1234-5678");
        customer.setId(10L);
        when(customerRepository.findById(10L)).thenReturn(Optional.of(customer));
        when(deliveryDestinationRepository.findById(50L)).thenReturn(Optional.empty());
    }

    // --- 出荷処理テスト ---

    @Test
    @WithMockUser(roles = "OWNER")
    void 出荷処理が成功する() throws Exception {
        Order shipped = createOrder(OrderStatus.SHIPPED);
        when(shipOrderUseCase.execute(1L)).thenReturn(shipped);
        setupProductAndCustomer();

        mockMvc.perform(put("/api/v1/admin/orders/1/ship"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SHIPPED"));
    }

    @Test
    @WithMockUser(roles = "OWNER")
    void 存在しない注文の出荷は404() throws Exception {
        when(shipOrderUseCase.execute(999L))
                .thenThrow(new EntityNotFoundException("注文", 999L));

        mockMvc.perform(put("/api/v1/admin/orders/999/ship"))
                .andExpect(status().isNotFound());
    }

    // --- キャンセルテスト ---

    @Test
    @WithMockUser(roles = "OWNER")
    void キャンセルが成功する() throws Exception {
        Order cancelled = createOrder(OrderStatus.CANCELLED);
        when(cancelOrderUseCase.execute(1L)).thenReturn(cancelled);
        setupProductAndCustomer();

        mockMvc.perform(put("/api/v1/admin/orders/1/cancel"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"));
    }

    @Test
    @WithMockUser(roles = "OWNER")
    void 準備中の注文キャンセルは業務ルール違反() throws Exception {
        when(cancelOrderUseCase.execute(1L))
                .thenThrow(new BusinessRuleViolationException("ステータスがPREPARINGの注文はキャンセルできません"));

        mockMvc.perform(put("/api/v1/admin/orders/1/cancel"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    void 得意先はキャンセルAPIにアクセスできない() throws Exception {
        mockMvc.perform(put("/api/v1/admin/orders/1/cancel"))
                .andExpect(status().isForbidden());
    }

    // --- 届け日変更テスト ---

    @Test
    @WithMockUser(roles = "OWNER")
    void 届け日変更が成功する() throws Exception {
        LocalDate newDate = LocalDate.of(2026, 6, 10);
        Order rescheduled = new Order(1L, 10L, 100L, 50L,
                DeliveryDate.reconstruct(newDate),
                new Message(null),
                OrderStatus.ORDERED, LocalDateTime.now(), LocalDateTime.now());
        when(rescheduleOrderUseCase.execute(eq(1L), any(LocalDate.class))).thenReturn(rescheduled);
        setupProductAndCustomer();

        mockMvc.perform(put("/api/v1/admin/orders/1/reschedule")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"newDeliveryDate\":\"2026-06-10\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.deliveryDate").value("2026-06-10"));
    }

    @Test
    @WithMockUser(roles = "OWNER")
    void 在庫不足の届け日変更は業務ルール違反() throws Exception {
        when(rescheduleOrderUseCase.execute(eq(1L), any(LocalDate.class)))
                .thenThrow(new BusinessRuleViolationException("在庫が不足しています"));

        mockMvc.perform(put("/api/v1/admin/orders/1/reschedule")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"newDeliveryDate\":\"2026-06-10\"}"))
                .andExpect(status().isBadRequest());
    }

    // --- 在庫チェック API テスト ---

    @Test
    @WithMockUser(roles = "OWNER")
    void 在庫チェックが充足を返す() throws Exception {
        when(rescheduleOrderUseCase.check(eq(1L), any(LocalDate.class)))
                .thenReturn(DeliveryDateChangeResult.success());

        mockMvc.perform(get("/api/v1/admin/orders/1/reschedule-check")
                        .param("date", "2026-06-10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.available").value(true));
    }

    @Test
    @WithMockUser(roles = "OWNER")
    void 在庫チェックが不足と代替日を返す() throws Exception {
        when(rescheduleOrderUseCase.check(eq(1L), any(LocalDate.class)))
                .thenReturn(DeliveryDateChangeResult.failure(
                        "バラが2本不足",
                        Map.of("バラ", 2),
                        List.of(LocalDate.of(2026, 6, 12), LocalDate.of(2026, 6, 15))));

        mockMvc.perform(get("/api/v1/admin/orders/1/reschedule-check")
                        .param("date", "2026-06-10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.available").value(false))
                .andExpect(jsonPath("$.reason").value("バラが2本不足"))
                .andExpect(jsonPath("$.shortageItems.バラ").value(2))
                .andExpect(jsonPath("$.alternativeDates").isArray())
                .andExpect(jsonPath("$.alternativeDates[0]").value("2026-06-12"));
    }
}
