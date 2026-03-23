package com.frerememoire.webshop.application.customer;

import com.frerememoire.webshop.domain.auth.AuthUser;
import com.frerememoire.webshop.domain.auth.port.AuthUserRepository;
import com.frerememoire.webshop.domain.customer.Customer;
import com.frerememoire.webshop.domain.customer.port.CustomerRepository;
import com.frerememoire.webshop.domain.order.Order;
import com.frerememoire.webshop.domain.product.Product;
import com.frerememoire.webshop.domain.product.port.ProductRepository;
import com.frerememoire.webshop.domain.shared.EntityNotFoundException;
import com.frerememoire.webshop.application.order.OrderQueryService;

import java.util.List;

public class GetCustomerDetailUseCase {

    private final CustomerRepository customerRepository;
    private final OrderQueryService orderQueryService;
    private final ProductRepository productRepository;
    private final AuthUserRepository authUserRepository;

    public GetCustomerDetailUseCase(CustomerRepository customerRepository,
                                     OrderQueryService orderQueryService,
                                     ProductRepository productRepository,
                                     AuthUserRepository authUserRepository) {
        this.customerRepository = customerRepository;
        this.orderQueryService = orderQueryService;
        this.productRepository = productRepository;
        this.authUserRepository = authUserRepository;
    }

    public CustomerDetailResponse execute(Long customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new EntityNotFoundException("得意先", customerId));

        String email = authUserRepository.findById(customer.getUserId())
                .map(AuthUser::getEmail)
                .orElse(null);

        List<Order> orders = orderQueryService.findByCustomerId(customerId);

        List<CustomerDetailResponse.OrderSummary> orderSummaries = orders.stream()
                .map(order -> {
                    String productName = productRepository.findById(order.getProductId())
                            .map(Product::getName)
                            .orElse("不明な商品");
                    return new CustomerDetailResponse.OrderSummary(
                            order.getId(),
                            productName,
                            order.getDeliveryDateValue(),
                            order.getStatus().name(),
                            order.getOrderedAt()
                    );
                })
                .toList();

        return new CustomerDetailResponse(
                customer.getId(),
                customer.getName(),
                email,
                customer.getPhone(),
                customer.getCreatedAt(),
                orderSummaries
        );
    }
}
