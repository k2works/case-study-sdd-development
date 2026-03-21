package com.frerememoire.webshop.infrastructure.api.order;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record OrderRequest(
        @NotNull(message = "商品IDは必須です")
        Long productId,

        @NotNull(message = "届け日は必須です")
        LocalDate deliveryDate,

        @NotBlank(message = "届け先氏名は必須です")
        @Size(max = 100, message = "届け先氏名は100文字以内で入力してください")
        String recipientName,

        @NotBlank(message = "郵便番号は必須です")
        @Size(max = 10, message = "郵便番号は10文字以内で入力してください")
        String postalCode,

        @NotBlank(message = "住所は必須です")
        @Size(max = 500, message = "住所は500文字以内で入力してください")
        String address,

        @Size(max = 20, message = "電話番号は20文字以内で入力してください")
        String phone,

        @Size(max = 200, message = "メッセージは200文字以内で入力してください")
        String message
) {
}
