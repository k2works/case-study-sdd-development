package com.frerememoire.webshop;

import com.frerememoire.webshop.domain.auth.port.AuthUserRepository;
import com.frerememoire.webshop.domain.customer.port.CustomerRepository;
import com.frerememoire.webshop.domain.order.OrderStatus;
import com.frerememoire.webshop.domain.order.port.OrderRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class WebshopApplicationTest {

    @Autowired
    private AuthUserRepository authUserRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Test
    void contextLoads() {
    }

    @Test
    void 開発用受注データが投入される() {
        var customerUser = authUserRepository.findByEmail("customer@example.com");

        assertThat(customerUser).isPresent();

        var customer = customerRepository.findByUserId(customerUser.get().getId());
        assertThat(customer).isPresent();

        var orders = orderRepository.findByCustomerId(customer.get().getId());

        assertThat(orders).hasSize(3);
        assertThat(orders)
                .extracting(order -> order.getStatus())
                .contains(OrderStatus.ORDERED, OrderStatus.ACCEPTED);
    }
}
