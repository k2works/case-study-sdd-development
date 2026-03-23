package com.frerememoire.webshop.infrastructure.api.order;

import com.frerememoire.webshop.application.order.OrderQueryService;
import com.frerememoire.webshop.application.order.PlaceOrderCommand;
import com.frerememoire.webshop.application.order.PlaceOrderUseCase;
import com.frerememoire.webshop.domain.auth.port.AuthUserRepository;
import com.frerememoire.webshop.domain.order.Order;
import com.frerememoire.webshop.domain.shared.EntityNotFoundException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/orders")
@Tag(name = "注文", description = "得意先向け注文操作")
public class OrderController {

    private final PlaceOrderUseCase placeOrderUseCase;
    private final OrderQueryService orderQueryService;
    private final AuthUserRepository authUserRepository;

    public OrderController(PlaceOrderUseCase placeOrderUseCase,
                           OrderQueryService orderQueryService,
                           AuthUserRepository authUserRepository) {
        this.placeOrderUseCase = placeOrderUseCase;
        this.orderQueryService = orderQueryService;
        this.authUserRepository = authUserRepository;
    }

    @Operation(summary = "花束を注文する", description = "商品を選択し届け先情報を指定して注文を作成する")
    @PostMapping
    public ResponseEntity<OrderResponse> placeOrder(@Valid @RequestBody OrderRequest request,
                                                     Authentication authentication) {
        Long userId = getUserId(authentication);
        PlaceOrderCommand command = new PlaceOrderCommand(
                userId, request.productId(), request.deliveryDate(),
                request.recipientName(), request.postalCode(), request.address(),
                request.phone(), request.message());
        Order order = placeOrderUseCase.placeOrder(command);
        return ResponseEntity.status(HttpStatus.CREATED).body(OrderResponse.fromDomain(order));
    }

    @Operation(summary = "自分の注文一覧", description = "ログインユーザーの注文履歴を取得する")
    @GetMapping("/my")
    public ResponseEntity<List<OrderResponse>> getMyOrders(Authentication authentication) {
        Long userId = getUserId(authentication);
        List<OrderResponse> orders = orderQueryService.findByUserId(userId).stream()
                .map(OrderResponse::fromDomain)
                .toList();
        return ResponseEntity.ok(orders);
    }

    private Long getUserId(Authentication authentication) {
        String email = authentication.getName();
        return authUserRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("ユーザー", email))
                .getId();
    }
}
