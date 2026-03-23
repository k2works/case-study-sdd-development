package com.frerememoire.webshop.infrastructure.api.customer;

import com.frerememoire.webshop.application.customer.CustomerDetailResponse;
import com.frerememoire.webshop.application.customer.GetCustomerDetailUseCase;
import com.frerememoire.webshop.domain.customer.Customer;
import com.frerememoire.webshop.domain.customer.port.CustomerQueryPort;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/customers")
@Tag(name = "得意先管理", description = "得意先一覧・検索・詳細（管理者向け）")
public class CustomerAdminController {

    private final CustomerQueryPort customerQueryPort;
    private final GetCustomerDetailUseCase getCustomerDetailUseCase;

    public CustomerAdminController(CustomerQueryPort customerQueryPort,
                                    GetCustomerDetailUseCase getCustomerDetailUseCase) {
        this.customerQueryPort = customerQueryPort;
        this.getCustomerDetailUseCase = getCustomerDetailUseCase;
    }

    @Operation(summary = "得意先一覧", description = "名前で部分一致検索可能")
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

    @Operation(summary = "得意先詳細", description = "基本情報と注文履歴を取得する")
    @GetMapping("/{id}")
    public ResponseEntity<CustomerDetailApiResponse> getCustomerDetail(
            @PathVariable Long id) {
        CustomerDetailResponse detail = getCustomerDetailUseCase.execute(id);
        return ResponseEntity.ok(CustomerDetailApiResponse.fromUseCase(detail));
    }
}
