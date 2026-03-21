package com.frerememoire.webshop.infrastructure.api;

import com.frerememoire.webshop.domain.shared.BusinessRuleViolationException;
import com.frerememoire.webshop.domain.shared.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;

import static org.assertj.core.api.Assertions.assertThat;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void EntityNotFoundExceptionの場合は404のProblemDetailを返す() {
        EntityNotFoundException exception = new EntityNotFoundException("商品", 1L);

        ProblemDetail result = handler.handleEntityNotFound(exception);

        assertThat(result.getStatus()).isEqualTo(HttpStatus.NOT_FOUND.value());
        assertThat(result.getTitle()).isEqualTo("リソースが見つかりません");
        assertThat(result.getDetail()).isEqualTo("商品(id=1) が見つかりません");
    }

    @Test
    void DomainExceptionの場合は400のProblemDetailを返す() {
        BusinessRuleViolationException exception =
                new BusinessRuleViolationException("在庫が不足しています");

        ProblemDetail result = handler.handleDomainException(exception);

        assertThat(result.getStatus()).isEqualTo(HttpStatus.BAD_REQUEST.value());
        assertThat(result.getTitle()).isEqualTo("ビジネスルール違反");
        assertThat(result.getDetail()).isEqualTo("在庫が不足しています");
    }
}
