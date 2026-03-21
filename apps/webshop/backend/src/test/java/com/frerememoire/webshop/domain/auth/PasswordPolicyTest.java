package com.frerememoire.webshop.domain.auth;

import com.frerememoire.webshop.domain.shared.BusinessRuleViolationException;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class PasswordPolicyTest {

    @Test
    void 正常なパスワードはバリデーションを通過する() {
        assertThatCode(() -> PasswordPolicy.validate("Password1"))
                .doesNotThrowAnyException();
    }

    @Test
    void パスワードが8文字未満の場合は拒否される() {
        assertThatThrownBy(() -> PasswordPolicy.validate("Pass1"))
                .isInstanceOf(BusinessRuleViolationException.class)
                .hasMessageContaining("8文字以上");
    }

    @Test
    void 英字のみのパスワードは拒否される() {
        assertThatThrownBy(() -> PasswordPolicy.validate("PasswordOnly"))
                .isInstanceOf(BusinessRuleViolationException.class)
                .hasMessageContaining("数字");
    }

    @Test
    void 数字のみのパスワードは拒否される() {
        assertThatThrownBy(() -> PasswordPolicy.validate("12345678"))
                .isInstanceOf(BusinessRuleViolationException.class)
                .hasMessageContaining("英字");
    }

    @Test
    void nullのパスワードは拒否される() {
        assertThatThrownBy(() -> PasswordPolicy.validate(null))
                .isInstanceOf(BusinessRuleViolationException.class);
    }
}
