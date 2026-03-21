package com.frerememoire.webshop.infrastructure.api.product;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ProductRequest(
        @NotBlank(message = "商品名は必須です")
        @Size(max = 50, message = "商品名は50文字以内で入力してください")
        String name,

        @Min(value = 1, message = "価格は1〜999,999円の範囲で設定してください")
        int price,

        String description
) {
}
