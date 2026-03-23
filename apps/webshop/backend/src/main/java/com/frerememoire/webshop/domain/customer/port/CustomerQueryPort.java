package com.frerememoire.webshop.domain.customer.port;

import com.frerememoire.webshop.domain.customer.Customer;

import java.util.List;

public interface CustomerQueryPort {

    List<Customer> findAll();

    List<Customer> searchByName(String name);
}
