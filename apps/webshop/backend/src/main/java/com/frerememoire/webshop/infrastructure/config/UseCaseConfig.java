package com.frerememoire.webshop.infrastructure.config;

import com.frerememoire.webshop.application.auth.AuthenticationUseCase;
import com.frerememoire.webshop.application.auth.RegistrationUseCase;
import com.frerememoire.webshop.application.item.ItemUseCase;
import com.frerememoire.webshop.domain.auth.PasswordEncoder;
import com.frerememoire.webshop.domain.auth.port.AuthUserRepository;
import com.frerememoire.webshop.domain.item.port.ItemRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class UseCaseConfig {

    @Bean
    public AuthenticationUseCase authenticationUseCase(
            AuthUserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        return new AuthenticationUseCase(userRepository, passwordEncoder);
    }

    @Bean
    public RegistrationUseCase registrationUseCase(
            AuthUserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        return new RegistrationUseCase(userRepository, passwordEncoder);
    }

    @Bean
    public ItemUseCase itemUseCase(ItemRepository itemRepository) {
        return new ItemUseCase(itemRepository);
    }
}
