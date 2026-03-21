package com.frerememoire.webshop.domain.shared;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class DomainExceptionTest {

    @Test
    void BusinessRuleViolationExceptionはメッセージを保持する() {
        var exception = new BusinessRuleViolationException("ビジネスルール違反");

        assertThat(exception.getMessage()).isEqualTo("ビジネスルール違反");
        assertThat(exception).isInstanceOf(DomainException.class);
        assertThat(exception).isInstanceOf(RuntimeException.class);
    }

    @Test
    void EntityNotFoundExceptionはエンティティ名とIDをメッセージに含む() {
        var exception = new EntityNotFoundException("User", 1L);

        assertThat(exception.getMessage()).isEqualTo("User(id=1) が見つかりません");
        assertThat(exception).isInstanceOf(DomainException.class);
    }
}
