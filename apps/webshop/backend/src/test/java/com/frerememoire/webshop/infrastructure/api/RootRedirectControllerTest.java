package com.frerememoire.webshop.infrastructure.api;

import com.frerememoire.webshop.infrastructure.security.JwtAuthenticationFilter;
import com.frerememoire.webshop.infrastructure.security.JwtTokenProvider;
import com.frerememoire.webshop.infrastructure.security.SecurityConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.redirectedUrl;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(RootRedirectController.class)
@Import({SecurityConfig.class, JwtTokenProvider.class, JwtAuthenticationFilter.class})
class RootRedirectControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void ルートアクセス時にSwaggerUIへリダイレクトする() throws Exception {
        mockMvc.perform(get("/"))
            .andExpect(status().is3xxRedirection())
            .andExpect(redirectedUrl("/swagger-ui/index.html"));
    }
}
