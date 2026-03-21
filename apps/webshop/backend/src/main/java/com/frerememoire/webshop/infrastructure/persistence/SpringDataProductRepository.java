package com.frerememoire.webshop.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SpringDataProductRepository extends JpaRepository<ProductEntity, Long> {
    List<ProductEntity> findByIsActiveTrue();
}
