package com.frerememoire.webshop.infrastructure.api.customer;

import com.frerememoire.webshop.application.customer.CustomerDetailResponse;
import com.frerememoire.webshop.application.customer.GetCustomerDetailUseCase;
import com.frerememoire.webshop.domain.customer.Customer;
import com.frerememoire.webshop.domain.customer.port.CustomerQueryPort;
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

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(CustomerAdminController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
class CustomerAdminControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CustomerQueryPort customerQueryPort;

    @MockitoBean
    private GetCustomerDetailUseCase getCustomerDetailUseCase;

    @MockitoBean
    private JwtTokenProvider jwtTokenProvider;

    @Test
    @WithMockUser(roles = "OWNER")
    void 経営者が得意先一覧を取得できる() throws Exception {
        List<Customer> customers = List.of(
                new Customer(1L, 10L, "山田太郎", "090-1111-1111",
                        LocalDateTime.of(2026, 1, 1, 0, 0),
                        LocalDateTime.of(2026, 1, 1, 0, 0)),
                new Customer(2L, 20L, "鈴木花子", "090-2222-2222",
                        LocalDateTime.of(2026, 2, 1, 0, 0),
                        LocalDateTime.of(2026, 2, 1, 0, 0))
        );
        when(customerQueryPort.findAll()).thenReturn(customers);

        mockMvc.perform(get("/api/v1/admin/customers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].name").value("山田太郎"))
                .andExpect(jsonPath("$[0].phone").value("090-1111-1111"))
                .andExpect(jsonPath("$[1].id").value(2))
                .andExpect(jsonPath("$[1].name").value("鈴木花子"));
    }

    @Test
    @WithMockUser(roles = "OWNER")
    void 名前で部分一致検索できる() throws Exception {
        List<Customer> customers = List.of(
                new Customer(1L, 10L, "山田太郎", "090-1111-1111",
                        LocalDateTime.of(2026, 1, 1, 0, 0),
                        LocalDateTime.of(2026, 1, 1, 0, 0))
        );
        when(customerQueryPort.searchByName("山田")).thenReturn(customers);

        mockMvc.perform(get("/api/v1/admin/customers")
                        .param("name", "山田"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("山田太郎"))
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    @WithMockUser(roles = "OWNER")
    void 得意先詳細を注文履歴付きで取得できる() throws Exception {
        CustomerDetailResponse detail = new CustomerDetailResponse(
                1L, "山田太郎", "yamada@example.com", "090-1111-1111",
                LocalDateTime.of(2026, 1, 1, 0, 0),
                List.of(new CustomerDetailResponse.OrderSummary(
                        100L, "春の花束", LocalDate.of(2026, 6, 1),
                        "ORDERED", LocalDateTime.of(2026, 5, 1, 10, 0)
                ))
        );
        when(getCustomerDetailUseCase.execute(1L)).thenReturn(detail);

        mockMvc.perform(get("/api/v1/admin/customers/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.customer.id").value(1))
                .andExpect(jsonPath("$.customer.name").value("山田太郎"))
                .andExpect(jsonPath("$.customer.email").value("yamada@example.com"))
                .andExpect(jsonPath("$.customer.phone").value("090-1111-1111"))
                .andExpect(jsonPath("$.orders[0].id").value(100))
                .andExpect(jsonPath("$.orders[0].productName").value("春の花束"))
                .andExpect(jsonPath("$.orders[0].status").value("ORDERED"));
    }

    @Test
    @WithMockUser(roles = "OWNER")
    void 得意先詳細で注文履歴が0件の場合は空リストを返す() throws Exception {
        CustomerDetailResponse detail = new CustomerDetailResponse(
                1L, "山田太郎", "yamada@example.com", "090-1111-1111",
                LocalDateTime.of(2026, 1, 1, 0, 0),
                List.of()
        );
        when(getCustomerDetailUseCase.execute(1L)).thenReturn(detail);

        mockMvc.perform(get("/api/v1/admin/customers/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.customer.name").value("山田太郎"))
                .andExpect(jsonPath("$.orders").isEmpty());
    }

    @Test
    @WithMockUser(roles = "OWNER")
    void 検索結果が0件の場合は空リストを返す() throws Exception {
        when(customerQueryPort.searchByName("存在しない名前")).thenReturn(List.of());

        mockMvc.perform(get("/api/v1/admin/customers")
                        .param("name", "存在しない名前"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isEmpty());
    }

    // --- IT8: 認可テスト ---

    @Test
    @WithMockUser(roles = "CUSTOMER")
    void 得意先ロールで一覧にアクセスすると403() throws Exception {
        mockMvc.perform(get("/api/v1/admin/customers"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    void 得意先ロールで詳細にアクセスすると403() throws Exception {
        mockMvc.perform(get("/api/v1/admin/customers/1"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ORDER_STAFF")
    void 受注スタッフロールで得意先管理にアクセスすると403() throws Exception {
        mockMvc.perform(get("/api/v1/admin/customers"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "PURCHASE_STAFF")
    void 仕入スタッフロールで得意先管理にアクセスすると403() throws Exception {
        mockMvc.perform(get("/api/v1/admin/customers"))
                .andExpect(status().isForbidden());
    }

    @Test
    void 未認証ユーザーはアクセスできない() throws Exception {
        mockMvc.perform(get("/api/v1/admin/customers"))
                .andExpect(status().isForbidden());
    }

    @Test
    void 未認証ユーザーは得意先詳細にアクセスできない() throws Exception {
        mockMvc.perform(get("/api/v1/admin/customers/1"))
                .andExpect(status().isForbidden());
    }
}
