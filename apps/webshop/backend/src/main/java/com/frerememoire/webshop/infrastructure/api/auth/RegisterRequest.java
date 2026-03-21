package com.frerememoire.webshop.infrastructure.api.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "メールアドレスは必須です")
        @Email(message = "メールアドレスの形式が正しくありません")
        String email,

        @NotBlank(message = "パスワードは必須です")
        String password,

        @NotBlank(message = "姓は必須です")
        @Size(max = 100, message = "姓は100文字以内で入力してください")
        String firstName,

        @NotBlank(message = "名は必須です")
        @Size(max = 100, message = "名は100文字以内で入力してください")
        String lastName,

        String phone
) {
}
