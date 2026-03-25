package com.frerememoire.webshop.infrastructure.web;

import com.frerememoire.webshop.application.auth.AuthUseCase;
import com.frerememoire.webshop.application.auth.LoginResult;
import com.frerememoire.webshop.domain.model.user.Role;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AuthUseCase authUseCase;

    @Test
    void shouldReturnTokenOnSuccessfulLogin() throws Exception {
        // Given: 有効な認証情報
        LoginResult loginResult = new LoginResult("jwt-token-123", Role.CUSTOMER.name(), "テスト太郎");
        when(authUseCase.login(any())).thenReturn(loginResult);

        String requestBody = """
                {
                    "email": "customer@example.com",
                    "password": "password123"
                }
                """;

        // When: POST /api/v1/auth/login にリクエストを送信する
        // Then: HTTP 200 OK とトークンが返る
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwt-token-123"))
                .andExpect(jsonPath("$.role").value("CUSTOMER"))
                .andExpect(jsonPath("$.name").value("テスト太郎"));
    }

    @Test
    void shouldReturn401OnAuthenticationFailure() throws Exception {
        // Given: 無効な認証情報
        when(authUseCase.login(any()))
                .thenThrow(new RuntimeException("メールアドレスまたはパスワードが正しくありません"));

        String requestBody = """
                {
                    "email": "wrong@example.com",
                    "password": "wrongPassword"
                }
                """;

        // When: POST /api/v1/auth/login にリクエストを送信する
        // Then: HTTP 401 Unauthorized が返る
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldReturn423OnAccountLocked() throws Exception {
        // Given: ロックされたアカウント
        when(authUseCase.login(any()))
                .thenThrow(new RuntimeException("アカウントがロックされています"));

        String requestBody = """
                {
                    "email": "locked@example.com",
                    "password": "password123"
                }
                """;

        // When: POST /api/v1/auth/login にリクエストを送信する
        // Then: HTTP 423 Locked が返る
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isLocked());
    }

    @Test
    void shouldReturn401ForProtectedEndpointWithoutToken() throws Exception {
        // Given: 認証トークンなし

        // When: 保護されたエンドポイントにアクセスする
        // Then: HTTP 401 Unauthorized が返る
        mockMvc.perform(get("/api/v1/protected-endpoint"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldAllowAccessToLoginEndpointWithoutToken() throws Exception {
        // Given: 認証トークンなし
        LoginResult loginResult = new LoginResult("token", Role.CUSTOMER.name(), "ユーザー");
        when(authUseCase.login(any())).thenReturn(loginResult);

        String requestBody = """
                {
                    "email": "customer@example.com",
                    "password": "password123"
                }
                """;

        // When: ログインエンドポイントにトークンなしでアクセスする
        // Then: アクセスが許可される（HTTP 200）
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk());
    }

    @Test
    void shouldReturnStaffRoleOnSuccessfulStaffLogin() throws Exception {
        // Given: スタッフユーザーの認証情報
        LoginResult loginResult = new LoginResult("jwt-token-456", Role.ORDER_STAFF.name(), "スタッフ太郎");
        when(authUseCase.login(any())).thenReturn(loginResult);

        String requestBody = """
                {
                    "email": "staff@example.com",
                    "password": "password123"
                }
                """;

        // When: POST /api/v1/auth/login にリクエストを送信する
        // Then: スタッフロールが返る
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("ORDER_STAFF"));
    }
}
