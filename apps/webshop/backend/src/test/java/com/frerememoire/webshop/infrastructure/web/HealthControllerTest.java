package com.frerememoire.webshop.infrastructure.web;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class HealthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldReturnOkStatus() throws Exception {
        // Given: Actuator ヘルスチェックエンドポイントが有効

        // When: GET /api/health にリクエストを送信する
        // Then: HTTP 200 OK が返る
        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk());
    }

    @Test
    void shouldReturnStatusUpInResponseBody() throws Exception {
        // Given: Actuator ヘルスチェックエンドポイントが有効

        // When: GET /api/health にリクエストを送信する
        // Then: レスポンスボディに status: "UP" が含まれる
        mockMvc.perform(get("/api/health"))
                .andExpect(jsonPath("$.status").value("UP"));
    }

    @Test
    void shouldReturnJsonContentType() throws Exception {
        // Given: Actuator ヘルスチェックエンドポイントが有効

        // When: GET /api/health にリクエストを送信する
        // Then: Content-Type が application/json である
        mockMvc.perform(get("/api/health"))
                .andExpect(content().contentType("application/vnd.spring-boot.actuator.v3+json"));
    }
}
