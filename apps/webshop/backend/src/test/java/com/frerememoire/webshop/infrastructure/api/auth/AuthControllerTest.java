package com.frerememoire.webshop.infrastructure.api.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.frerememoire.webshop.application.auth.AuthenticationUseCase;
import com.frerememoire.webshop.application.auth.RegistrationUseCase;
import com.frerememoire.webshop.domain.auth.AuthUser;
import com.frerememoire.webshop.domain.auth.Role;
import com.frerememoire.webshop.domain.auth.UserProfile;
import com.frerememoire.webshop.domain.shared.BusinessRuleViolationException;
import com.frerememoire.webshop.domain.shared.EntityNotFoundException;
import com.frerememoire.webshop.infrastructure.security.JwtAuthenticationFilter;
import com.frerememoire.webshop.infrastructure.security.JwtTokenProvider;
import com.frerememoire.webshop.infrastructure.security.SecurityConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private AuthenticationUseCase authenticationUseCase;

    @MockitoBean
    private RegistrationUseCase registrationUseCase;

    @MockitoBean
    private JwtTokenProvider jwtTokenProvider;

    @Test
    void ログインが成功する() throws Exception {
        AuthUser user = AuthUser.create("test@example.com", "encoded",
                Role.CUSTOMER, new UserProfile("太郎", "山田", null));
        when(authenticationUseCase.authenticate("test@example.com", "Password1"))
                .thenReturn(user);
        when(jwtTokenProvider.generateToken("test@example.com", "CUSTOMER"))
                .thenReturn("jwt-token");

        LoginRequest request = new LoginRequest("test@example.com", "Password1");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwt-token"))
                .andExpect(jsonPath("$.email").value("test@example.com"))
                .andExpect(jsonPath("$.role").value("CUSTOMER"));
    }

    @Test
    void 認証失敗で401が返る() throws Exception {
        when(authenticationUseCase.authenticate(anyString(), anyString()))
                .thenThrow(new BusinessRuleViolationException(
                        "メールアドレスまたはパスワードが正しくありません"));

        LoginRequest request = new LoginRequest("test@example.com", "WrongPass1");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void 存在しないユーザーで404が返る() throws Exception {
        when(authenticationUseCase.authenticate(anyString(), anyString()))
                .thenThrow(new EntityNotFoundException("ユーザー", "unknown@example.com"));

        LoginRequest request = new LoginRequest("unknown@example.com", "Password1");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound());
    }

    @Test
    void ログインのバリデーションエラーで400が返る() throws Exception {
        LoginRequest request = new LoginRequest("", "");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void 新規登録が成功する() throws Exception {
        AuthUser user = AuthUser.create("new@example.com", "encoded",
                Role.CUSTOMER, new UserProfile("太郎", "山田", "090-1234-5678"));
        user.setId(1L);
        when(registrationUseCase.register(anyString(), anyString(),
                anyString(), anyString(), any()))
                .thenReturn(user);
        when(jwtTokenProvider.generateToken("new@example.com", "CUSTOMER"))
                .thenReturn("jwt-token");

        RegisterRequest request = new RegisterRequest(
                "new@example.com", "Password1", "太郎", "山田", "090-1234-5678");

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").value("jwt-token"))
                .andExpect(jsonPath("$.email").value("new@example.com"))
                .andExpect(jsonPath("$.firstName").value("太郎"));
    }

    @Test
    void 登録済みメールで409が返る() throws Exception {
        when(registrationUseCase.register(anyString(), anyString(),
                anyString(), anyString(), any()))
                .thenThrow(new BusinessRuleViolationException(
                        "このメールアドレスは既に登録されています"));

        RegisterRequest request = new RegisterRequest(
                "existing@example.com", "Password1", "山田", "太郎", null);

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void 新規登録のバリデーションエラーで400が返る() throws Exception {
        RegisterRequest request = new RegisterRequest(
                "invalid-email", "Password1", "", "", null);

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }
}
