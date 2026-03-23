package com.frerememoire.webshop.infrastructure.api.shipping;

import com.frerememoire.webshop.application.shipping.ShipmentQueryService;
import com.frerememoire.webshop.application.shipping.ShipmentTarget;
import com.frerememoire.webshop.application.shipping.ShipmentTargetsResult;
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

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ShipmentController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
class ShipmentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ShipmentQueryService shipmentQueryService;

    @MockitoBean
    private JwtTokenProvider jwtTokenProvider;

    @Test
    @WithMockUser(roles = "DELIVERY_STAFF")
    void 配送スタッフが出荷対象一覧を取得できる() throws Exception {
        LocalDate date = LocalDate.of(2026, 6, 1);
        ShipmentTargetsResult result = new ShipmentTargetsResult(
                date,
                List.of(new ShipmentTarget(1L, "春の花束", date, "PREPARING",
                        "田中花子", "東京都千代田区1-1-1"))
        );
        when(shipmentQueryService.getTargets(date)).thenReturn(result);

        mockMvc.perform(get("/api/v1/admin/shipments")
                        .param("date", "2026-06-01"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.deliveryDate").value("2026-06-01"))
                .andExpect(jsonPath("$.targets[0].orderId").value(1))
                .andExpect(jsonPath("$.targets[0].recipientName").value("田中花子"));
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    void 得意先は出荷対象にアクセスできない() throws Exception {
        mockMvc.perform(get("/api/v1/admin/shipments"))
                .andExpect(status().isForbidden());
    }

    @Test
    void 未認証ユーザーは出荷対象にアクセスできない() throws Exception {
        mockMvc.perform(get("/api/v1/admin/shipments"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "DELIVERY_STAFF")
    void 出荷対象が空の場合は空配列を返す() throws Exception {
        LocalDate today = LocalDate.now();
        when(shipmentQueryService.getTargets(today)).thenReturn(
                new ShipmentTargetsResult(today, List.of()));

        mockMvc.perform(get("/api/v1/admin/shipments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.targets").isEmpty());
    }
}
