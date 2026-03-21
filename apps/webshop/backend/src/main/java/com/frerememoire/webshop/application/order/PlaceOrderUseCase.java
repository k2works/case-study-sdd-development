package com.frerememoire.webshop.application.order;

import com.frerememoire.webshop.domain.customer.Customer;
import com.frerememoire.webshop.domain.customer.DeliveryDestination;
import com.frerememoire.webshop.domain.customer.port.CustomerRepository;
import com.frerememoire.webshop.domain.customer.port.DeliveryDestinationRepository;
import com.frerememoire.webshop.domain.order.Order;
import com.frerememoire.webshop.domain.order.port.OrderRepository;
import com.frerememoire.webshop.domain.product.port.ProductRepository;
import com.frerememoire.webshop.domain.shared.EntityNotFoundException;

import java.time.LocalDate;

public class PlaceOrderUseCase {

    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final DeliveryDestinationRepository deliveryDestinationRepository;
    private final ProductRepository productRepository;

    public PlaceOrderUseCase(OrderRepository orderRepository,
                              CustomerRepository customerRepository,
                              DeliveryDestinationRepository deliveryDestinationRepository,
                              ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.customerRepository = customerRepository;
        this.deliveryDestinationRepository = deliveryDestinationRepository;
        this.productRepository = productRepository;
    }

    public Order placeOrder(Long userId, Long productId, LocalDate deliveryDate,
                            String recipientName, String postalCode, String address,
                            String phone, String message) {
        Customer customer = customerRepository.findByUserId(userId)
                .orElseThrow(() -> new EntityNotFoundException("得意先", userId));

        if (!productRepository.existsById(productId)) {
            throw new EntityNotFoundException("商品", productId);
        }

        DeliveryDestination destination = DeliveryDestination.create(
                customer.getId(), recipientName, postalCode, address, phone);
        destination = deliveryDestinationRepository.save(destination);

        Order order = Order.create(customer.getId(), productId,
                destination.getId(), deliveryDate, message);

        return orderRepository.save(order);
    }
}
