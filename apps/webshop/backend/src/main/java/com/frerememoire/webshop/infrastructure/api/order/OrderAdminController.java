package com.frerememoire.webshop.infrastructure.api.order;

import com.frerememoire.webshop.application.order.CancelOrderUseCase;
import com.frerememoire.webshop.application.order.DeliveryDateChangeResult;
import com.frerememoire.webshop.application.order.OrderQueryService;
import com.frerememoire.webshop.application.order.RescheduleOrderUseCase;
import com.frerememoire.webshop.application.shipping.ShipOrderUseCase;
import com.frerememoire.webshop.domain.customer.Customer;
import com.frerememoire.webshop.domain.customer.DeliveryDestination;
import com.frerememoire.webshop.domain.customer.port.CustomerRepository;
import com.frerememoire.webshop.domain.customer.port.DeliveryDestinationRepository;
import com.frerememoire.webshop.domain.order.Order;
import com.frerememoire.webshop.domain.order.OrderStatus;
import com.frerememoire.webshop.domain.product.Product;
import com.frerememoire.webshop.domain.product.port.ProductRepository;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/orders")
public class OrderAdminController {

    private final OrderQueryService orderQueryService;
    private final ShipOrderUseCase shipOrderUseCase;
    private final CancelOrderUseCase cancelOrderUseCase;
    private final RescheduleOrderUseCase rescheduleOrderUseCase;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final DeliveryDestinationRepository deliveryDestinationRepository;

    public OrderAdminController(OrderQueryService orderQueryService,
                                 ShipOrderUseCase shipOrderUseCase,
                                 CancelOrderUseCase cancelOrderUseCase,
                                 RescheduleOrderUseCase rescheduleOrderUseCase,
                                 ProductRepository productRepository,
                                 CustomerRepository customerRepository,
                                 DeliveryDestinationRepository deliveryDestinationRepository) {
        this.orderQueryService = orderQueryService;
        this.shipOrderUseCase = shipOrderUseCase;
        this.cancelOrderUseCase = cancelOrderUseCase;
        this.rescheduleOrderUseCase = rescheduleOrderUseCase;
        this.productRepository = productRepository;
        this.customerRepository = customerRepository;
        this.deliveryDestinationRepository = deliveryDestinationRepository;
    }

    @GetMapping
    public ResponseEntity<List<OrderResponse>> findAll(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        List<Order> orders;
        if (from != null && to != null) {
            orders = orderQueryService.findByStatusAndDateRange(status, from, to);
        } else {
            orders = orderQueryService.findAll();
        }
        List<OrderResponse> response = orders.stream()
                .map(this::toResponseWithDetails)
                .toList();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> findById(@PathVariable Long id) {
        Order order = orderQueryService.findById(id);
        return ResponseEntity.ok(toResponseWithDetails(order));
    }

    @PutMapping("/{id}/accept")
    public ResponseEntity<OrderResponse> acceptOrder(@PathVariable Long id) {
        Order order = orderQueryService.acceptOrder(id);
        return ResponseEntity.ok(toResponseWithDetails(order));
    }

    @PutMapping("/bulk-accept")
    public ResponseEntity<List<OrderResponse>> bulkAcceptOrders(
            @Valid @RequestBody BulkAcceptRequest request) {
        List<Order> orders = orderQueryService.bulkAcceptOrders(request.orderIds());
        List<OrderResponse> response = orders.stream()
                .map(this::toResponseWithDetails)
                .toList();
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<OrderResponse> cancelOrder(@PathVariable Long id) {
        Order order = cancelOrderUseCase.execute(id);
        return ResponseEntity.ok(toResponseWithDetails(order));
    }

    @PutMapping("/{id}/ship")
    public ResponseEntity<OrderResponse> shipOrder(@PathVariable Long id) {
        Order order = shipOrderUseCase.execute(id);
        return ResponseEntity.ok(toResponseWithDetails(order));
    }

    @PutMapping("/{id}/reschedule")
    public ResponseEntity<OrderResponse> rescheduleOrder(
            @PathVariable Long id,
            @Valid @RequestBody RescheduleRequest request) {
        Order order = rescheduleOrderUseCase.execute(id, request.newDeliveryDate());
        return ResponseEntity.ok(toResponseWithDetails(order));
    }

    @GetMapping("/{id}/reschedule-check")
    public ResponseEntity<RescheduleCheckResponse> checkReschedule(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        DeliveryDateChangeResult result = rescheduleOrderUseCase.check(id, date);
        return ResponseEntity.ok(RescheduleCheckResponse.fromResult(result));
    }

    private OrderResponse toResponseWithDetails(Order order) {
        String productName = productRepository.findById(order.getProductId())
                .map(Product::getName)
                .orElse("不明");
        String customerName = customerRepository.findById(order.getCustomerId())
                .map(Customer::getName)
                .orElse("不明");
        String recipientName = null;
        String deliveryAddress = null;
        var dest = deliveryDestinationRepository.findById(order.getDeliveryDestinationId());
        if (dest.isPresent()) {
            DeliveryDestination d = dest.get();
            recipientName = d.getRecipientName();
            deliveryAddress = d.getAddress();
        }
        return OrderResponse.fromDomainWithDetails(order, productName, customerName,
                recipientName, deliveryAddress);
    }
}
