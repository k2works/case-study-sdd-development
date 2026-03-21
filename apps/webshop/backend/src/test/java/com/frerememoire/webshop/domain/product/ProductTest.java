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
    void 商品名が50文字ちょうどの場合は正常に作成できる() {
        String name = "あ".repeat(50);
        Product product = Product.create(name, 5000, null);

        assertThat(product.getName()).isEqualTo(name);
    }

    @Test
    void 価格が0の場合は例外が発生する() {
        assertThatThrownBy(() -> Product.create("春の花束", 0, null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("1〜999999");
    }

    @Test
    void 価格が0未満の場合は例外が発生する() {
        assertThatThrownBy(() -> Product.create("春の花束", -1, null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("1〜999999");
    }

    @Test
    void 価格が1の場合は正常に作成できる() {
        Product product = Product.create("春の花束", 1, null);

        assertThat(product.getPrice()).isEqualTo(1);
    }

    @Test
    void 価格が999999の場合は正常に作成できる() {
        Product product = Product.create("春の花束", 999_999, null);

        assertThat(product.getPrice()).isEqualTo(999_999);
    }

    @Test
    void 価格が1000000の場合は例外が発生する() {
        assertThatThrownBy(() -> Product.create("春の花束", 1_000_000, null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("1〜999999");
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

    @Test
    void 構成を追加できる() {
        Product product = Product.create("春の花束", 5000, null);

        product.addComposition(1L, 3);

        assertThat(product.getCompositions()).hasSize(1);
        assertThat(product.getCompositions().get(0).getItemId()).isEqualTo(1L);
        assertThat(product.getCompositions().get(0).getQuantity()).isEqualTo(3);
    }

    @Test
    void 同じ単品を重複して追加すると例外が発生する() {
        Product product = Product.create("春の花束", 5000, null);
        product.addComposition(1L, 3);

        assertThatThrownBy(() -> product.addComposition(1L, 2))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("既に構成に含まれています");
    }

    @Test
    void 存在しない構成を削除すると例外が発生する() {
        Product product = Product.create("春の花束", 5000, null);

        assertThatThrownBy(() -> product.removeComposition(999L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("構成に含まれていません");
    }

    @Test
    void 構成を削除できる() {
        Product product = Product.create("春の花束", 5000, null);
        product.addComposition(1L, 3);

        product.removeComposition(1L);

        assertThat(product.getCompositions()).isEmpty();
    }

    @Test
    void 構成追加時にitemIdがnullの場合は例外が発生する() {
        Product product = Product.create("春の花束", 5000, null);

        assertThatThrownBy(() -> product.addComposition(null, 3))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("単品IDは必須です");
    }

    @Test
    void 構成追加時にquantityが0の場合は例外が発生する() {
        Product product = Product.create("春の花束", 5000, null);

        assertThatThrownBy(() -> product.addComposition(1L, 0))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("1以上");
    }
}
