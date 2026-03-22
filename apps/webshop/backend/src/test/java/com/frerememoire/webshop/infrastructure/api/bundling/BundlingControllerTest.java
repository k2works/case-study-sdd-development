package com.frerememoire.webshop.infrastructure.api.bundling;

import com.frerememoire.webshop.application.bundling.BundleOrderUseCase;
import com.frerememoire.webshop.application.bundling.BundlingQueryService;
import com.frerememoire.webshop.application.bundling.BundlingTarget;
import com.frerememoire.webshop.application.bundling.BundlingTargetsResult;
import com.frerememoire.webshop.application.bundling.MaterialSummary;
import com.frerememoire.webshop.application.bundling.RequiredItem;
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
import java.util.List;

import com.frerememoire.webshop.domain.order.DeliveryDate;
import com.frerememoire.webshop.domain.order.Message;
import com.frerememoire.webshop.domain.order.Order;
import com.frerememoire.webshop.domain.order.OrderStatus;

import java.time.LocalDateTime;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(BundlingController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
class BundlingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private BundlingQueryService bundlingQueryService;

    @MockitoBean
    private BundleOrderUseCase bundleOrderUseCase;

    @MockitoBean
    private JwtTokenProvider jwtTokenProvider;

    @Test
    @WithMockUser(roles = "FLORIST")
    void FLORISTが結束対象一覧を取得できる() throws Exception {
        LocalDate date = LocalDate.of(2026, 6, 1);
        BundlingTargetsResult result = new BundlingTargetsResult(
                date,
                List.of(new BundlingTarget(1L, "春の花束", date, "ACCEPTED",
                        List.of(new RequiredItem(1L, "バラ", 3)))),
                List.of(new MaterialSummary(1L, "バラ", 3, 10, 0))
        );
        when(bundlingQueryService.getTargets(date)).thenReturn(result);

        mockMvc.perform(get("/api/v1/admin/bundling/targets")
                        .param("date", "2026-06-01"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.shippingDate").value("2026-06-01"))
                .andExpect(jsonPath("$.targets").isArray())
                .andExpect(jsonPath("$.targets[0].orderId").value(1))
                .andExpect(jsonPath("$.targets[0].productName").value("春の花束"))
                .andExpect(jsonPath("$.materialSummary[0].itemName").value("バラ"));
    }

    @Test
    @WithMockUser(roles = "OWNER")
    void OWNERが結束対象一覧を取得できる() throws Exception {
        LocalDate today = LocalDate.now();
        BundlingTargetsResult result = new BundlingTargetsResult(today, List.of(), List.of());
        when(bundlingQueryService.getTargets(today)).thenReturn(result);

        mockMvc.perform(get("/api/v1/admin/bundling/targets"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.targets").isArray());
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    void CUSTOMERは結束対象にアクセスできない() throws Exception {
        mockMvc.perform(get("/api/v1/admin/bundling/targets"))
                .andExpect(status().isForbidden());
    }

    @Test
    void 未認証ユーザーは結束対象にアクセスできない() throws Exception {
        mockMvc.perform(get("/api/v1/admin/bundling/targets"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "FLORIST")
    void FLORISTが結束完了を実行できる() throws Exception {
        LocalDate deliveryDate = LocalDate.now().plusDays(3);
        Order order = new Order(1L, 10L, 100L, 50L,
                DeliveryDate.reconstruct(deliveryDate),
                new Message(null),
                OrderStatus.PREPARING, LocalDateTime.now(), LocalDateTime.now());
        when(bundleOrderUseCase.execute(1L)).thenReturn(order);

        mockMvc.perform(put("/api/v1/admin/bundling/orders/1/bundle"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderId").value(1))
                .andExpect(jsonPath("$.status").value("PREPARING"));
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    void CUSTOMERは結束完了を実行できない() throws Exception {
        mockMvc.perform(put("/api/v1/admin/bundling/orders/1/bundle"))
                .andExpect(status().isForbidden());
    }
}
