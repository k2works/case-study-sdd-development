package com.frerememoire.webshop.infrastructure.api.item;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.frerememoire.webshop.application.item.ItemUseCase;
import com.frerememoire.webshop.domain.item.Item;
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

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ItemController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
class ItemControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private ItemUseCase itemUseCase;

    @MockitoBean
    private JwtTokenProvider jwtTokenProvider;

    @Test
    @WithMockUser(roles = "CUSTOMER")
    void 単品一覧を取得できる() throws Exception {
        Item item = Item.create("バラ", 7, 10, 3, "花卸問屋A");
        item.setId(1L);
        when(itemUseCase.findAll()).thenReturn(List.of(item));

        mockMvc.perform(get("/api/v1/items"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("バラ"))
                .andExpect(jsonPath("$[0].id").value(1));
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    void IDで単品を取得できる() throws Exception {
        Item item = Item.create("バラ", 7, 10, 3, "花卸問屋A");
        item.setId(1L);
        when(itemUseCase.findById(1L)).thenReturn(item);

        mockMvc.perform(get("/api/v1/items/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("バラ"));
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    void 存在しない単品で404が返る() throws Exception {
        when(itemUseCase.findById(99L))
                .thenThrow(new EntityNotFoundException("単品", 99L));

        mockMvc.perform(get("/api/v1/items/99"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    void 単品を登録できる() throws Exception {
        Item item = Item.create("バラ", 7, 10, 3, "花卸問屋A");
        item.setId(1L);
        when(itemUseCase.create(anyString(), anyInt(), anyInt(), anyInt(), anyString()))
                .thenReturn(item);

        ItemRequest request = new ItemRequest("バラ", 7, 10, 3, "花卸問屋A");

        mockMvc.perform(post("/api/v1/items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("バラ"));
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    void 単品を更新できる() throws Exception {
        Item item = Item.create("チューリップ", 5, 20, 2, "花卸問屋B");
        item.setId(1L);
        when(itemUseCase.update(anyLong(), anyString(), anyInt(), anyInt(), anyInt(), anyString()))
                .thenReturn(item);

        ItemRequest request = new ItemRequest("チューリップ", 5, 20, 2, "花卸問屋B");

        mockMvc.perform(put("/api/v1/items/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("チューリップ"));
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    void 単品を削除できる() throws Exception {
        doNothing().when(itemUseCase).delete(1L);

        mockMvc.perform(delete("/api/v1/items/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    void バリデーションエラーで400が返る() throws Exception {
        ItemRequest request = new ItemRequest("", 0, 0, 0, "");

        mockMvc.perform(post("/api/v1/items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void 未認証でアクセスが拒否される() throws Exception {
        mockMvc.perform(get("/api/v1/items"))
                .andExpect(status().isForbidden());
    }
}
