package com.frerememoire.webshop.infrastructure.api.customer;

import com.frerememoire.webshop.application.customer.CustomerDetailResponse;
import com.frerememoire.webshop.application.customer.GetCustomerDetailUseCase;
import com.frerememoire.webshop.domain.customer.Customer;
import com.frerememoire.webshop.domain.customer.port.CustomerQueryPort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/customers")
public class CustomerAdminController {

    private final CustomerQueryPort customerQueryPort;
    private final GetCustomerDetailUseCase getCustomerDetailUseCase;

    public CustomerAdminController(CustomerQueryPort customerQueryPort,
                                    GetCustomerDetailUseCase getCustomerDetailUseCase) {
        this.customerQueryPort = customerQueryPort;
        this.getCustomerDetailUseCase = getCustomerDetailUseCase;
    }

    @GetMapping
    public ResponseEntity<List<CustomerResponse>> getCustomers(
            @RequestParam(required = false) String name) {
        List<Customer> customers;
        if (name != null && !name.isBlank()) {
            customers = customerQueryPort.searchByName(name);
        } else {
            customers = customerQueryPort.findAll();
        }

        List<CustomerResponse> response = customers.stream()
                .map(CustomerResponse::fromDomain)
                .toList();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CustomerDetailApiResponse> getCustomerDetail(
            @PathVariable Long id) {
        CustomerDetailResponse detail = getCustomerDetailUseCase.execute(id);
        return ResponseEntity.ok(CustomerDetailApiResponse.fromUseCase(detail));
    }
}
