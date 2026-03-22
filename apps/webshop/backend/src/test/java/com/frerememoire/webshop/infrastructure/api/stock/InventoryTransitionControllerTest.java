package com.frerememoire.webshop.infrastructure.api.stock;

import com.frerememoire.webshop.application.stock.InventoryTransitionUseCase;
import com.frerememoire.webshop.domain.stock.DailyInventory;
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

@WebMvcTest(InventoryTransitionController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
class InventoryTransitionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private InventoryTransitionUseCase useCase;

    @MockitoBean
    private JwtTokenProvider jwtTokenProvider;

    @Test
    @WithMockUser(roles = "PURCHASE_STAFF")
    void PURCHASE_STAFFが在庫推移を取得できる() throws Exception {
        LocalDate from = LocalDate.of(2026, 5, 5);
        LocalDate to = LocalDate.of(2026, 5, 5);
        DailyInventory daily = new DailyInventory(from, 100, 20, 10, 5);
        when(useCase.getTransition(1L, from, to)).thenReturn(List.of(daily));

        mockMvc.perform(get("/api/v1/admin/inventory/transition")
                        .param("itemId", "1")
                        .param("from", "2026-05-05")
                        .param("to", "2026-05-05"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].date").value("2026-05-05"))
                .andExpect(jsonPath("$[0].previousStock").value(100))
                .andExpect(jsonPath("$[0].projectedStock").value(105));
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    void CUSTOMERは在庫推移にアクセスできない() throws Exception {
        mockMvc.perform(get("/api/v1/admin/inventory/transition")
                        .param("itemId", "1")
                        .param("from", "2026-05-05")
                        .param("to", "2026-05-05"))
                .andExpect(status().isForbidden());
    }

    @Test
    void 未認証ユーザーは在庫推移にアクセスできない() throws Exception {
        mockMvc.perform(get("/api/v1/admin/inventory/transition")
                        .param("itemId", "1")
                        .param("from", "2026-05-05")
                        .param("to", "2026-05-05"))
                .andExpect(status().isForbidden());
    }
}
