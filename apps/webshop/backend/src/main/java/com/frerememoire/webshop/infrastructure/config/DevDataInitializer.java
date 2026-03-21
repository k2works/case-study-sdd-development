package com.frerememoire.webshop.infrastructure.config;

import com.frerememoire.webshop.application.auth.RegistrationUseCase;
import com.frerememoire.webshop.domain.auth.port.AuthUserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Component
@Profile("default")
public class DevDataInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DevDataInitializer.class);

    private final RegistrationUseCase registrationUseCase;
    private final AuthUserRepository authUserRepository;

    public DevDataInitializer(RegistrationUseCase registrationUseCase,
                               AuthUserRepository authUserRepository) {
        this.registrationUseCase = registrationUseCase;
        this.authUserRepository = authUserRepository;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!authUserRepository.existsByEmail("dev@example.com")) {
            registrationUseCase.register(
                    "dev@example.com", "Password1",
                    "太郎", "開発", null);
            log.info("開発用ユーザーを作成しました: dev@example.com / Password1");
        }
    }
}
