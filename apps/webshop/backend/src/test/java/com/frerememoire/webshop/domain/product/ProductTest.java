package com.frerememoire.webshop.domain.product;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ProductTest {

    @Test
    void 正常に商品を作成できる() {
        Product product = Product.create("春の花束", 5000, "春の花を使った華やかな花束");

        assertThat(product.getName()).isEqualTo("春の花束");
        assertThat(product.getPrice()).isEqualTo(5000);
        assertThat(product.getDescription()).isEqualTo("春の花を使った華やかな花束");
        assertThat(product.isActive()).isTrue();
        assertThat(product.getId()).isNull();
        assertThat(product.getCreatedAt()).isNotNull();
        assertThat(product.getUpdatedAt()).isNotNull();
    }

    @Test
    void 説明なしで商品を作成できる() {
        Product product = Product.create("春の花束", 5000, null);

        assertThat(product.getDescription()).isNull();
    }

    @Test
    void 商品名が空の場合は例外が発生する() {
        assertThatThrownBy(() -> Product.create("", 5000, null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("商品名は必須です");
    }

    @Test
    void 商品名がnullの場合は例外が発生する() {
        assertThatThrownBy(() -> Product.create(null, 5000, null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("商品名は必須です");
    }

    @Test
    void 商品名が50文字を超える場合は例外が発生する() {
        String longName = "あ".repeat(51);
        assertThatThrownBy(() -> Product.create(longName, 5000, null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("50文字以内");
    }

    @Test
    void 価格が0未満の場合は例外が発生する() {
        assertThatThrownBy(() -> Product.create("春の花束", -1, null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("0以上");
    }

    @Test
    void 価格が0の場合は正常に作成できる() {
        Product product = Product.create("春の花束", 0, null);
        assertThat(product.getPrice()).isZero();
    }

    @Test
    void 商品情報を更新できる() {
        Product product = Product.create("春の花束", 5000, "説明");

        product.update("夏の花束", 6000, "夏の花を使った花束");

        assertThat(product.getName()).isEqualTo("夏の花束");
        assertThat(product.getPrice()).isEqualTo(6000);
        assertThat(product.getDescription()).isEqualTo("夏の花を使った花束");
    }

    @Test
    void 更新時に商品名が空の場合は例外が発生する() {
        Product product = Product.create("春の花束", 5000, null);

        assertThatThrownBy(() -> product.update("", 5000, null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("商品名は必須です");
    }

    @Test
    void 商品を非アクティブにできる() {
        Product product = Product.create("春の花束", 5000, null);

        product.deactivate();

        assertThat(product.isActive()).isFalse();
    }

    @Test
    void 商品をアクティブに戻せる() {
        Product product = Product.create("春の花束", 5000, null);
        product.deactivate();

        product.activate();

        assertThat(product.isActive()).isTrue();
    }
}
