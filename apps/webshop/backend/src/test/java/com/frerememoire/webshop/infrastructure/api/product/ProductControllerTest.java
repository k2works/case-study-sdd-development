package com.frerememoire.webshop.infrastructure.api.product;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.frerememoire.webshop.application.item.ItemUseCase;
import com.frerememoire.webshop.application.product.ProductUseCase;
import com.frerememoire.webshop.domain.product.Product;
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

import java.util.ArrayList;
import java.util.List;

import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ProductController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
class ProductControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private ProductUseCase productUseCase;

    @MockitoBean
    private ItemUseCase itemUseCase;

    @MockitoBean
    private JwtTokenProvider jwtTokenProvider;

    @Test
    @WithMockUser(roles = "CUSTOMER")
    void 商品一覧を取得できる() throws Exception {
        Product product = Product.create("花束A", 3000, "バラの花束");
        product.setId(1L);
        when(productUseCase.findAll()).thenReturn(List.of(product));
        when(itemUseCase.findAll()).thenReturn(List.of());

        mockMvc.perform(get("/api/v1/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("花束A"))
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].price").value(3000));
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    void IDで商品を取得できる() throws Exception {
        Product product = Product.create("花束A", 3000, "バラの花束");
        product.setId(1L);
        when(productUseCase.findById(1L)).thenReturn(product);
        when(itemUseCase.findAll()).thenReturn(List.of());

        mockMvc.perform(get("/api/v1/products/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("花束A"))
                .andExpect(jsonPath("$.price").value(3000))
                .andExpect(jsonPath("$.description").value("バラの花束"));
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    void 存在しない商品で404が返る() throws Exception {
        when(productUseCase.findById(99L))
                .thenThrow(new EntityNotFoundException("商品", 99L));

        mockMvc.perform(get("/api/v1/products/99"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    void 商品を登録できる() throws Exception {
        Product product = Product.create("花束A", 3000, "バラの花束");
        product.setId(1L);
        when(productUseCase.create(anyString(), anyInt(), anyString()))
                .thenReturn(product);

        ProductRequest request = new ProductRequest("花束A", 3000, "バラの花束");

        mockMvc.perform(post("/api/v1/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("花束A"))
                .andExpect(jsonPath("$.price").value(3000));
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    void 商品を更新できる() throws Exception {
        Product product = Product.create("花束B", 5000, "チューリップの花束");
        product.setId(1L);
        when(productUseCase.update(anyLong(), anyString(), anyInt(), anyString()))
                .thenReturn(product);

        ProductRequest request = new ProductRequest("花束B", 5000, "チューリップの花束");

        mockMvc.perform(put("/api/v1/products/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("花束B"))
                .andExpect(jsonPath("$.price").value(5000));
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    void 商品を削除できる() throws Exception {
        Product product = Product.create("花束A", 3000, "バラの花束");
        product.setId(1L);
        product.deactivate();
        when(productUseCase.findById(1L)).thenReturn(product);

        mockMvc.perform(delete("/api/v1/products/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    void 構成一覧を取得できる() throws Exception {
        Product product = Product.create("花束A", 3000, "バラの花束");
        product.setId(1L);
        product.addComposition(10L, 3);
        when(productUseCase.findById(1L)).thenReturn(product);
        when(itemUseCase.findAll()).thenReturn(List.of());

        mockMvc.perform(get("/api/v1/products/1/compositions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].itemId").value(10))
                .andExpect(jsonPath("$[0].quantity").value(3));
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    void 構成を追加できる() throws Exception {
        Product product = Product.create("花束A", 3000, "バラの花束");
        product.setId(1L);
        product.addComposition(10L, 3);
        when(productUseCase.addComposition(anyLong(), anyLong(), anyInt()))
                .thenReturn(product);
        when(itemUseCase.findAll()).thenReturn(List.of());

        CompositionRequest request = new CompositionRequest(10L, 3);

        mockMvc.perform(post("/api/v1/products/1/compositions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.compositions[0].itemId").value(10))
                .andExpect(jsonPath("$.compositions[0].quantity").value(3));
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    void 構成を削除できる() throws Exception {
        Product product = Product.create("花束A", 3000, "バラの花束");
        product.setId(1L);
        when(productUseCase.removeComposition(anyLong(), anyLong()))
                .thenReturn(product);
        when(itemUseCase.findAll()).thenReturn(List.of());

        mockMvc.perform(delete("/api/v1/products/1/compositions/10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.compositions").isEmpty());
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    void バリデーションエラーで400が返る() throws Exception {
        ProductRequest request = new ProductRequest("", -1, null);

        mockMvc.perform(post("/api/v1/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void 未認証でアクセスが拒否される() throws Exception {
        mockMvc.perform(get("/api/v1/products"))
                .andExpect(status().isForbidden());
    }
}
