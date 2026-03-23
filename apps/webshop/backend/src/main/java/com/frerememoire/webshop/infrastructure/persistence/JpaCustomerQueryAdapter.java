package com.frerememoire.webshop.infrastructure.persistence;

import com.frerememoire.webshop.domain.customer.Customer;
import com.frerememoire.webshop.domain.customer.port.CustomerQueryPort;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class JpaCustomerQueryAdapter implements CustomerQueryPort {

    private final SpringDataCustomerRepository springDataRepository;

    public JpaCustomerQueryAdapter(SpringDataCustomerRepository springDataRepository) {
        this.springDataRepository = springDataRepository;
    }

    @Override
    public List<Customer> findAll() {
        return springDataRepository.findAll().stream()
                .map(CustomerEntity::toDomain)
                .toList();
    }

    @Override
    public List<Customer> searchByName(String name) {
        return springDataRepository.findByNameContaining(name).stream()
                .map(CustomerEntity::toDomain)
                .toList();
    }
}
