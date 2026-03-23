package com.frerememoire.webshop.infrastructure.api.customer;

import com.frerememoire.webshop.domain.customer.Customer;

import java.time.LocalDateTime;

public record CustomerResponse(
    Long id,
    String name,
    String phone,
    LocalDateTime createdAt
) {
    public static CustomerResponse fromDomain(Customer customer) {
        return new CustomerResponse(
                customer.getId(),
                customer.getName(),
                customer.getPhone(),
                customer.getCreatedAt()
        );
    }
}
