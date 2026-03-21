package com.frerememoire.webshop.infrastructure.config;

import com.frerememoire.webshop.application.auth.AuthenticationUseCase;
import com.frerememoire.webshop.application.auth.RegistrationUseCase;
import com.frerememoire.webshop.application.item.ItemUseCase;
import com.frerememoire.webshop.application.order.OrderQueryService;
import com.frerememoire.webshop.application.order.PlaceOrderUseCase;
import com.frerememoire.webshop.application.product.ProductUseCase;
import com.frerememoire.webshop.domain.auth.PasswordEncoder;
import com.frerememoire.webshop.domain.auth.port.AuthUserRepository;
import com.frerememoire.webshop.domain.customer.port.CustomerRepository;
import com.frerememoire.webshop.domain.customer.port.DeliveryDestinationRepository;
import com.frerememoire.webshop.domain.item.port.ItemRepository;
import com.frerememoire.webshop.domain.order.port.OrderRepository;
import com.frerememoire.webshop.domain.product.port.ProductRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class UseCaseConfig {

    @Bean
    public AuthenticationUseCase authenticationUseCase(
            AuthUserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        return new AuthenticationUseCase(userRepository, passwordEncoder);
    }

    @Bean
    public RegistrationUseCase registrationUseCase(
            AuthUserRepository userRepository,
            CustomerRepository customerRepository,
            PasswordEncoder passwordEncoder) {
        return new RegistrationUseCase(userRepository, customerRepository, passwordEncoder);
    }

    @Bean
    public ItemUseCase itemUseCase(ItemRepository itemRepository) {
        return new ItemUseCase(itemRepository);
    }

    @Bean
    public ProductUseCase productUseCase(ProductRepository productRepository, ItemRepository itemRepository) {
        return new ProductUseCase(productRepository, itemRepository);
    }

    @Bean
    public PlaceOrderUseCase placeOrderUseCase(OrderRepository orderRepository,
                                                CustomerRepository customerRepository,
                                                DeliveryDestinationRepository deliveryDestinationRepository,
                                                ProductRepository productRepository) {
        return new PlaceOrderUseCase(orderRepository, customerRepository,
                deliveryDestinationRepository, productRepository);
    }

    @Bean
    public OrderQueryService orderQueryService(OrderRepository orderRepository,
                                                CustomerRepository customerRepository) {
        return new OrderQueryService(orderRepository, customerRepository);
    }
}
