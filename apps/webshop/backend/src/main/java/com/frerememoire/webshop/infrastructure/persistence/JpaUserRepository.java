package com.frerememoire.webshop.infrastructure.persistence;

import com.frerememoire.webshop.domain.model.user.User;
import com.frerememoire.webshop.domain.repository.UserRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface JpaUserRepository
        extends JpaRepository<User, Long>, UserRepository {

    @Override
    Optional<User> findByEmail(String email);
}
