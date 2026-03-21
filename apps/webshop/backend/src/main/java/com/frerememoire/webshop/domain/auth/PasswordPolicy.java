package com.frerememoire.webshop.domain.auth;

import com.frerememoire.webshop.domain.shared.BusinessRuleViolationException;

public final class PasswordPolicy {

    private static final int MIN_LENGTH = 8;

    private PasswordPolicy() {
    }

    public static void validate(String rawPassword) {
        if (rawPassword == null || rawPassword.length() < MIN_LENGTH) {
            throw new BusinessRuleViolationException(
                    "パスワードは" + MIN_LENGTH + "文字以上で入力してください");
        }
        if (!rawPassword.matches(".*[a-zA-Z].*")) {
            throw new BusinessRuleViolationException(
                    "パスワードには英字を含めてください");
        }
        if (!rawPassword.matches(".*[0-9].*")) {
            throw new BusinessRuleViolationException(
                    "パスワードには数字を含めてください");
        }
    }
}
