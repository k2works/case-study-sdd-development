package com.frerememoire.webshop.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SpringDataCustomerRepository extends JpaRepository<CustomerEntity, Long> {

    Optional<CustomerEntity> findByUserId(Long userId);

    boolean existsByUserId(Long userId);

    List<CustomerEntity> findByNameContaining(String name);
}
