package com.frerememoire.webshop.infrastructure.api.customer;

import com.frerememoire.webshop.application.customer.GetDeliveryDestinationsUseCase;
import com.frerememoire.webshop.domain.auth.AuthUser;
import com.frerememoire.webshop.domain.auth.Role;
import com.frerememoire.webshop.domain.auth.UserProfile;
import com.frerememoire.webshop.domain.auth.port.AuthUserRepository;
import com.frerememoire.webshop.domain.customer.Customer;
import com.frerememoire.webshop.domain.customer.DeliveryDestination;
import com.frerememoire.webshop.domain.customer.port.CustomerRepository;
import com.frerememoire.webshop.infrastructure.security.JwtAuthenticationFilter;
import com.frerememoire.webshop.infrastructure.security.JwtTokenProvider;
import com.frerememoire.webshop.infrastructure.security.SecurityConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(DeliveryDestinationController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
class DeliveryDestinationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private GetDeliveryDestinationsUseCase getDeliveryDestinationsUseCase;

    @MockitoBean
    private AuthUserRepository authUserRepository;

    @MockitoBean
    private CustomerRepository customerRepository;

    @MockitoBean
    private JwtTokenProvider jwtTokenProvider;

    @Test
    @WithMockUser(username = "customer@example.com", roles = "CUSTOMER")
    void 得意先が過去の届け先一覧を取得できる() throws Exception {
        Long userId = 1L;
        Long customerId = 10L;
        setupAuthAndCustomer("customer@example.com", userId, customerId);

        List<DeliveryDestination> destinations = List.of(
            new DeliveryDestination(1L, customerId, "山田太郎", "100-0001",
                    "東京都千代田区", "090-1234-5678", LocalDateTime.now()),
            new DeliveryDestination(2L, customerId, "鈴木花子", "530-0001",
                    "大阪府大阪市北区", "080-9876-5432", LocalDateTime.now())
        );
        when(getDeliveryDestinationsUseCase.execute(customerId)).thenReturn(destinations);

        mockMvc.perform(get("/api/v1/customers/me/delivery-destinations"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].recipientName").value("山田太郎"))
                .andExpect(jsonPath("$[0].postalCode").value("100-0001"))
                .andExpect(jsonPath("$[0].address").value("東京都千代田区"))
                .andExpect(jsonPath("$[0].phone").value("090-1234-5678"))
                .andExpect(jsonPath("$[1].id").value(2))
                .andExpect(jsonPath("$[1].recipientName").value("鈴木花子"));
    }

    @Test
    @WithMockUser(username = "customer@example.com", roles = "CUSTOMER")
    void 届け先が0件の場合は空リストを返す() throws Exception {
        Long userId = 1L;
        Long customerId = 10L;
        setupAuthAndCustomer("customer@example.com", userId, customerId);

        when(getDeliveryDestinationsUseCase.execute(customerId)).thenReturn(List.of());

        mockMvc.perform(get("/api/v1/customers/me/delivery-destinations"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    void 未認証の場合はアクセスできない() throws Exception {
        mockMvc.perform(get("/api/v1/customers/me/delivery-destinations"))
                .andExpect(status().isForbidden());
    }

    // --- IT8: 認可テスト ---

    @Test
    @WithMockUser(username = "customerA@example.com", roles = "CUSTOMER")
    void 得意先Aは自分の届け先のみ取得でき得意先Bの届け先は含まれない() throws Exception {
        Long userIdA = 1L;
        Long customerIdA = 10L;
        setupAuthAndCustomer("customerA@example.com", userIdA, customerIdA);

        // 得意先 A の届け先のみ返す（得意先 B の届け先は含まれない）
        List<DeliveryDestination> destinationsA = List.of(
            new DeliveryDestination(1L, customerIdA, "得意先Aの届け先", "100-0001",
                    "東京都千代田区", "090-1234-5678", LocalDateTime.now())
        );
        when(getDeliveryDestinationsUseCase.execute(customerIdA)).thenReturn(destinationsA);

        mockMvc.perform(get("/api/v1/customers/me/delivery-destinations"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].recipientName").value("得意先Aの届け先"));
    }

    @Test
    @WithMockUser(username = "owner@example.com", roles = "OWNER")
    void 経営者ロールでも認証ユーザーとしてアクセスできる() throws Exception {
        Long userId = 5L;
        Long customerId = 50L;
        setupAuthAndCustomer("owner@example.com", userId, customerId);
        when(getDeliveryDestinationsUseCase.execute(customerId)).thenReturn(List.of());

        mockMvc.perform(get("/api/v1/customers/me/delivery-destinations"))
                .andExpect(status().isOk());
    }

    private void setupAuthAndCustomer(String email, Long userId, Long customerId) {
        AuthUser authUser = AuthUser.create(email, "encoded", Role.CUSTOMER,
                new UserProfile("太郎", "テスト", "090-0000-0000"));
        authUser.setId(userId);
        when(authUserRepository.findByEmail(email)).thenReturn(Optional.of(authUser));

        Customer customer = Customer.create(userId, "テスト顧客", "090-0000-0000");
        customer.setId(customerId);
        when(customerRepository.findByUserId(userId)).thenReturn(Optional.of(customer));
    }
}
