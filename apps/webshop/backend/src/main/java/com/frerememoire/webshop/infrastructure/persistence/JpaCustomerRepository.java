package com.frerememoire.webshop.infrastructure.persistence;

import com.frerememoire.webshop.domain.customer.Customer;
import com.frerememoire.webshop.domain.customer.port.CustomerRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public class JpaCustomerRepository implements CustomerRepository {

    private final SpringDataCustomerRepository springDataRepository;

    public JpaCustomerRepository(SpringDataCustomerRepository springDataRepository) {
        this.springDataRepository = springDataRepository;
    }

    @Override
    public Customer save(Customer customer) {
        CustomerEntity entity = CustomerEntity.fromDomain(customer);
        CustomerEntity saved = springDataRepository.save(entity);
        return saved.toDomain();
    }

    @Override
    public Optional<Customer> findById(Long id) {
        return springDataRepository.findById(id)
                .map(CustomerEntity::toDomain);
    }

    @Override
    public Optional<Customer> findByUserId(Long userId) {
        return springDataRepository.findByUserId(userId)
                .map(CustomerEntity::toDomain);
    }

    @Override
    public boolean existsByUserId(Long userId) {
        return springDataRepository.existsByUserId(userId);
    }
}
