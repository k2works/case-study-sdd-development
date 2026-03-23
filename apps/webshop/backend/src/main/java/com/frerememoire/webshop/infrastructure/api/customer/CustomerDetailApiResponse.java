package com.frerememoire.webshop.infrastructure.api.customer;

import com.frerememoire.webshop.application.customer.CustomerDetailResponse;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record CustomerDetailApiResponse(
    CustomerInfo customer,
    List<OrderInfo> orders
) {
    public record CustomerInfo(
        Long id,
        String name,
        String email,
        String phone,
        LocalDateTime createdAt
    ) {}

    public record OrderInfo(
        Long id,
        String productName,
        LocalDate deliveryDate,
        String status,
        LocalDateTime orderedAt
    ) {}

    public static CustomerDetailApiResponse fromUseCase(CustomerDetailResponse detail) {
        CustomerInfo customerInfo = new CustomerInfo(
                detail.id(),
                detail.name(),
                detail.email(),
                detail.phone(),
                detail.createdAt()
        );

        List<OrderInfo> orderInfos = detail.orders().stream()
                .map(o -> new OrderInfo(
                        o.id(),
                        o.productName(),
                        o.deliveryDate(),
                        o.status(),
                        o.orderedAt()
                ))
                .toList();

        return new CustomerDetailApiResponse(customerInfo, orderInfos);
    }
}
