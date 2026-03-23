package com.frerememoire.webshop.infrastructure.api.customer;

import com.frerememoire.webshop.application.customer.GetDeliveryDestinationsUseCase;
import com.frerememoire.webshop.domain.auth.port.AuthUserRepository;
import com.frerememoire.webshop.domain.customer.port.CustomerRepository;
import com.frerememoire.webshop.domain.shared.EntityNotFoundException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/customers/me")
@Tag(name = "届け先", description = "過去の届け先一覧（得意先向け）")
public class DeliveryDestinationController {

    private final GetDeliveryDestinationsUseCase getDeliveryDestinationsUseCase;
    private final AuthUserRepository authUserRepository;
    private final CustomerRepository customerRepository;

    public DeliveryDestinationController(
            GetDeliveryDestinationsUseCase getDeliveryDestinationsUseCase,
            AuthUserRepository authUserRepository,
            CustomerRepository customerRepository) {
        this.getDeliveryDestinationsUseCase = getDeliveryDestinationsUseCase;
        this.authUserRepository = authUserRepository;
        this.customerRepository = customerRepository;
    }

    @Operation(summary = "過去の届け先一覧", description = "リピート注文時に過去の届け先から選択するために使用する")
    @GetMapping("/delivery-destinations")
    public ResponseEntity<List<DeliveryDestinationResponse>> getDeliveryDestinations(
            Authentication authentication) {
        Long userId = getUserId(authentication);
        Long customerId = getCustomerId(userId);
        List<DeliveryDestinationResponse> responses =
                getDeliveryDestinationsUseCase.execute(customerId).stream()
                        .map(DeliveryDestinationResponse::fromDomain)
                        .toList();
        return ResponseEntity.ok(responses);
    }

    private Long getUserId(Authentication authentication) {
        String email = authentication.getName();
        return authUserRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("ユーザー", email))
                .getId();
    }

    private Long getCustomerId(Long userId) {
        return customerRepository.findByUserId(userId)
                .orElseThrow(() -> new EntityNotFoundException("得意先", userId))
                .getId();
    }
}
