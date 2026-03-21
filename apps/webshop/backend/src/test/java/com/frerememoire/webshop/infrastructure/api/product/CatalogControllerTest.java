package com.frerememoire.webshop.infrastructure.api.product;

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
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(CatalogController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
class CatalogControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ProductUseCase productUseCase;

    @MockitoBean
    private ItemUseCase itemUseCase;

    @MockitoBean
    private JwtTokenProvider jwtTokenProvider;

    @Test
    void アクティブな商品一覧を取得できる() throws Exception {
        Product product = Product.create("花束A", 3000, "バラの花束");
        product.setId(1L);
        when(productUseCase.findAllActive()).thenReturn(List.of(product));
        when(itemUseCase.findAll()).thenReturn(List.of());

        mockMvc.perform(get("/api/v1/catalog/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("花束A"))
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].price").value(3000));
    }

    @Test
    void 商品がない場合は空リストが返る() throws Exception {
        when(productUseCase.findAllActive()).thenReturn(List.of());
        when(itemUseCase.findAll()).thenReturn(List.of());

        mockMvc.perform(get("/api/v1/catalog/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    void IDでアクティブな商品の詳細を取得できる() throws Exception {
        Product product = Product.create("花束A", 3000, "バラの花束");
        product.setId(1L);
        when(productUseCase.findActiveById(1L)).thenReturn(product);
        when(itemUseCase.findAll()).thenReturn(List.of());

        mockMvc.perform(get("/api/v1/catalog/products/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("花束A"))
                .andExpect(jsonPath("$.price").value(3000))
                .andExpect(jsonPath("$.description").value("バラの花束"));
    }

    @Test
    void 非アクティブな商品は404が返る() throws Exception {
        when(productUseCase.findActiveById(99L))
                .thenThrow(new EntityNotFoundException("商品", 99L));

        mockMvc.perform(get("/api/v1/catalog/products/99"))
                .andExpect(status().isNotFound());
    }

    @Test
    void 認証なしでアクセスできる() throws Exception {
        when(productUseCase.findAllActive()).thenReturn(List.of());
        when(itemUseCase.findAll()).thenReturn(List.of());

        mockMvc.perform(get("/api/v1/catalog/products"))
                .andExpect(status().isOk());
    }
}
