package com.frerememoire.webshop.infrastructure.api.purchaseorder;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.frerememoire.webshop.application.purchaseorder.RegisterArrivalCommand;
import com.frerememoire.webshop.application.purchaseorder.RegisterArrivalUseCase;
import com.frerememoire.webshop.domain.purchaseorder.Arrival;
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

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ArrivalController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
class ArrivalControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private RegisterArrivalUseCase registerArrivalUseCase;

    @MockitoBean
    private JwtTokenProvider jwtTokenProvider;

    @Test
    @WithMockUser(roles = "PURCHASE_STAFF")
    void PURCHASE_STAFFが入荷を登録できる() throws Exception {
        Arrival arrival = new Arrival(1L, 1L, 10L, 10,
                LocalDateTime.of(2026, 4, 1, 0, 0));
        when(registerArrivalUseCase.execute(any(RegisterArrivalCommand.class))).thenReturn(arrival);

        ArrivalRequest request = new ArrivalRequest(10, LocalDate.of(2026, 4, 1));

        mockMvc.perform(post("/api/v1/admin/purchase-orders/1/arrivals")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.purchaseOrderId").value(1))
                .andExpect(jsonPath("$.itemId").value(10))
                .andExpect(jsonPath("$.quantity").value(10));
    }

    @Test
    @WithMockUser(roles = "PURCHASE_STAFF")
    void 存在しない発注で入荷登録すると404() throws Exception {
        when(registerArrivalUseCase.execute(any(RegisterArrivalCommand.class)))
                .thenThrow(new EntityNotFoundException("発注", 99L));

        ArrivalRequest request = new ArrivalRequest(10, LocalDate.of(2026, 4, 1));

        mockMvc.perform(post("/api/v1/admin/purchase-orders/99/arrivals")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = "PURCHASE_STAFF")
    void 残数量超過で入荷登録すると400() throws Exception {
        when(registerArrivalUseCase.execute(any(RegisterArrivalCommand.class)))
                .thenThrow(new BusinessRuleViolationException("入荷数量(30)が残数量(20)を超えています"));

        ArrivalRequest request = new ArrivalRequest(30, LocalDate.of(2026, 4, 1));

        mockMvc.perform(post("/api/v1/admin/purchase-orders/1/arrivals")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    void CUSTOMERは入荷登録にアクセスできない() throws Exception {
        ArrivalRequest request = new ArrivalRequest(10, LocalDate.of(2026, 4, 1));

        mockMvc.perform(post("/api/v1/admin/purchase-orders/1/arrivals")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }
}
