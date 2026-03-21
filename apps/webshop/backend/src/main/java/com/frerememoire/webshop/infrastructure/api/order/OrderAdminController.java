package com.frerememoire.webshop.infrastructure.api.order;

import com.frerememoire.webshop.application.order.OrderQueryService;
import com.frerememoire.webshop.domain.order.Order;
import com.frerememoire.webshop.domain.order.OrderStatus;
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
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/orders")
public class OrderAdminController {

    private final OrderQueryService orderQueryService;

    public OrderAdminController(OrderQueryService orderQueryService) {
        this.orderQueryService = orderQueryService;
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
                .map(OrderResponse::fromDomain)
                .toList();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> findById(@PathVariable Long id) {
        Order order = orderQueryService.findById(id);
        return ResponseEntity.ok(OrderResponse.fromDomain(order));
    }

    @PutMapping("/{id}/accept")
    public ResponseEntity<OrderResponse> acceptOrder(@PathVariable Long id) {
        Order order = orderQueryService.acceptOrder(id);
        return ResponseEntity.ok(OrderResponse.fromDomain(order));
    }

    @PutMapping("/bulk-accept")
    public ResponseEntity<List<OrderResponse>> bulkAcceptOrders(
            @Valid @RequestBody BulkAcceptRequest request) {
        List<Order> orders = orderQueryService.bulkAcceptOrders(request.orderIds());
        List<OrderResponse> response = orders.stream()
                .map(OrderResponse::fromDomain)
                .toList();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/dashboard/summary")
    public ResponseEntity<Map<String, Object>> getDashboardSummary() {
        List<Order> allOrders = orderQueryService.findAll();
        long orderedCount = allOrders.stream()
                .filter(o -> o.getStatus() == OrderStatus.ORDERED).count();
        long acceptedCount = allOrders.stream()
                .filter(o -> o.getStatus() == OrderStatus.ACCEPTED).count();
        long totalCount = allOrders.size();

        return ResponseEntity.ok(Map.of(
                "totalOrders", totalCount,
                "orderedCount", orderedCount,
                "acceptedCount", acceptedCount
        ));
    }
}
