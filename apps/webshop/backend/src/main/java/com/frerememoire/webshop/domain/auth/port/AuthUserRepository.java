package com.frerememoire.webshop.domain.auth.port;

import com.frerememoire.webshop.domain.auth.AuthUser;

import java.util.Optional;

public interface AuthUserRepository {

    Optional<AuthUser> findByEmail(String email);

    AuthUser save(AuthUser user);

    boolean existsByEmail(String email);
}
