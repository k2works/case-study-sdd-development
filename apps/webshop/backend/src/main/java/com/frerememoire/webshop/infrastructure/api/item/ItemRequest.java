package com.frerememoire.webshop.infrastructure.api.item;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ItemRequest(
        @NotBlank(message = "商品名は必須です")
        @Size(max = 200, message = "商品名は200文字以内で入力してください")
        String name,

        @Min(value = 1, message = "品質保持日数は1以上である必要があります")
        int shelfLifeDays,

        @Min(value = 1, message = "発注単位は1以上である必要があります")
        int purchaseUnit,

        @Min(value = 1, message = "リードタイムは1以上である必要があります")
        int leadTimeDays,

        @NotBlank(message = "仕入先名は必須です")
        @Size(max = 200, message = "仕入先名は200文字以内で入力してください")
        String supplierName
) {
}
