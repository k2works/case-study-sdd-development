package com.frerememoire.webshop.domain.repository;

import com.frerememoire.webshop.domain.model.user.User;

import java.util.Optional;

public interface UserRepository {

    Optional<User> findByEmail(String email);

    User save(User user);
}
