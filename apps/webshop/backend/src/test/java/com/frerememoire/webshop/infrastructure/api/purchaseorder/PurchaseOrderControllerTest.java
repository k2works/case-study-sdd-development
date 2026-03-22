package com.frerememoire.webshop.infrastructure.api.purchaseorder;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.frerememoire.webshop.application.purchaseorder.PlacePurchaseOrderUseCase;
import com.frerememoire.webshop.application.purchaseorder.PurchaseOrderQueryService;
import com.frerememoire.webshop.domain.purchaseorder.PurchaseOrder;
import com.frerememoire.webshop.domain.purchaseorder.PurchaseOrderStatus;
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

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(PurchaseOrderController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
class PurchaseOrderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private PlacePurchaseOrderUseCase placeUseCase;

    @MockitoBean
    private PurchaseOrderQueryService queryService;

    @MockitoBean
    private JwtTokenProvider jwtTokenProvider;

    @Test
    @WithMockUser(roles = "PURCHASE_STAFF")
    void PURCHASE_STAFFが発注を作成できる() throws Exception {
        PurchaseOrder po = new PurchaseOrder(1L, 1L, "花卸問屋A", 20,
                LocalDate.of(2026, 5, 10), PurchaseOrderStatus.ORDERED,
                LocalDateTime.now(), LocalDateTime.now());
        when(placeUseCase.place(anyLong(), anyInt(), any())).thenReturn(po);

        PurchaseOrderRequest request = new PurchaseOrderRequest(1L, 20, LocalDate.of(2026, 5, 10));

        mockMvc.perform(post("/api/v1/admin/purchase-orders")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.supplierName").value("花卸問屋A"))
                .andExpect(jsonPath("$.quantity").value(20))
                .andExpect(jsonPath("$.status").value("ORDERED"));
    }

    @Test
    @WithMockUser(roles = "PURCHASE_STAFF")
    void PURCHASE_STAFFが発注一覧を取得できる() throws Exception {
        PurchaseOrder po = new PurchaseOrder(1L, 1L, "花卸問屋A", 20,
                LocalDate.of(2026, 5, 10), PurchaseOrderStatus.ORDERED,
                LocalDateTime.now(), LocalDateTime.now());
        when(queryService.findAll()).thenReturn(List.of(po));

        mockMvc.perform(get("/api/v1/admin/purchase-orders"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].supplierName").value("花卸問屋A"));
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    void CUSTOMERは発注にアクセスできない() throws Exception {
        mockMvc.perform(get("/api/v1/admin/purchase-orders"))
                .andExpect(status().isForbidden());
    }
}
