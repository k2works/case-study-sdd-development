package com.frerememoire.webshop.application.order;

import com.frerememoire.webshop.domain.customer.Customer;
import com.frerememoire.webshop.domain.customer.DeliveryDestination;
import com.frerememoire.webshop.domain.customer.port.CustomerRepository;
import com.frerememoire.webshop.domain.customer.port.DeliveryDestinationRepository;
import com.frerememoire.webshop.domain.order.Order;
import com.frerememoire.webshop.domain.order.port.OrderRepository;
import com.frerememoire.webshop.domain.product.port.ProductRepository;
import com.frerememoire.webshop.domain.shared.EntityNotFoundException;

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

    public Order placeOrder(PlaceOrderCommand command) {
        Customer customer = customerRepository.findByUserId(command.userId())
                .orElseThrow(() -> new EntityNotFoundException("得意先", command.userId()));

        if (!productRepository.existsById(command.productId())) {
            throw new EntityNotFoundException("商品", command.productId());
        }

        DeliveryDestination destination = DeliveryDestination.create(
                customer.getId(), command.recipientName(), command.postalCode(),
                command.address(), command.phone());
        destination = deliveryDestinationRepository.save(destination);

        Order order = Order.create(customer.getId(), command.productId(),
                destination.getId(), command.deliveryDate(), command.message());

        return orderRepository.save(order);
    }
}
