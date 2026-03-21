package com.frerememoire.webshop.domain.customer.port;

import com.frerememoire.webshop.domain.customer.Customer;

import java.util.Optional;

public interface CustomerRepository {

    Customer save(Customer customer);

    Optional<Customer> findById(Long id);

    Optional<Customer> findByUserId(Long userId);

    boolean existsByUserId(Long userId);
}
