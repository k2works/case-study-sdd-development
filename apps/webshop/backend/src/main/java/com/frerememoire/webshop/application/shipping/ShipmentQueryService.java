package com.frerememoire.webshop.application.shipping;

import com.frerememoire.webshop.domain.customer.DeliveryDestination;
import com.frerememoire.webshop.domain.customer.port.DeliveryDestinationRepository;
import com.frerememoire.webshop.domain.order.Order;
import com.frerememoire.webshop.domain.order.OrderStatus;
import com.frerememoire.webshop.domain.order.port.OrderRepository;
import com.frerememoire.webshop.domain.product.Product;
import com.frerememoire.webshop.domain.product.port.ProductRepository;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class ShipmentQueryService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final DeliveryDestinationRepository deliveryDestinationRepository;

    public ShipmentQueryService(OrderRepository orderRepository,
                                 ProductRepository productRepository,
                                 DeliveryDestinationRepository deliveryDestinationRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.deliveryDestinationRepository = deliveryDestinationRepository;
    }

    public ShipmentTargetsResult getTargets(LocalDate deliveryDate) {
        List<Order> orders = orderRepository.findByDeliveryDateAndStatus(deliveryDate, OrderStatus.PREPARING);

        if (orders.isEmpty()) {
            return new ShipmentTargetsResult(deliveryDate, List.of());
        }

        List<ShipmentTarget> targets = new ArrayList<>();
        for (Order order : orders) {
            String productName = productRepository.findById(order.getProductId())
                    .map(Product::getName)
                    .orElse("不明");

            String recipientName = null;
            String deliveryAddress = null;
            var dest = deliveryDestinationRepository.findById(order.getDeliveryDestinationId());
            if (dest.isPresent()) {
                DeliveryDestination d = dest.get();
                recipientName = d.getRecipientName();
                deliveryAddress = d.getAddress();
            }

            targets.add(new ShipmentTarget(
                    order.getId(),
                    productName,
                    order.getDeliveryDateValue(),
                    order.getStatus().name(),
                    recipientName,
                    deliveryAddress
            ));
        }

        return new ShipmentTargetsResult(deliveryDate, targets);
    }
}
