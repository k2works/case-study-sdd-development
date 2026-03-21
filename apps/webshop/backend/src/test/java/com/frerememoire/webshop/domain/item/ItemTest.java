package com.frerememoire.webshop.domain.item;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ItemTest {

    @Test
    void 正常に単品を作成できる() {
        Item item = Item.create("バラ（赤）", 7, 10, 3, "花卸問屋A");

        assertThat(item.getName()).isEqualTo("バラ（赤）");
        assertThat(item.getShelfLifeDays()).isEqualTo(7);
        assertThat(item.getPurchaseUnit()).isEqualTo(10);
        assertThat(item.getLeadTimeDays()).isEqualTo(3);
        assertThat(item.getSupplierName()).isEqualTo("花卸問屋A");
    }

    @Test
    void 商品名が空の場合は例外が発生する() {
        assertThatThrownBy(() -> Item.create("", 7, 10, 3, "花卸問屋A"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("商品名は必須です");
    }

    @Test
    void 商品名が200文字を超える場合は例外が発生する() {
        String longName = "あ".repeat(201);
        assertThatThrownBy(() -> Item.create(longName, 7, 10, 3, "花卸問屋A"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("200文字以内");
    }

    @Test
    void 品質保持日数が0以下の場合は例外が発生する() {
        assertThatThrownBy(() -> Item.create("バラ", 0, 10, 3, "花卸問屋A"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("1以上");
    }

    @Test
    void 発注単位が0以下の場合は例外が発生する() {
        assertThatThrownBy(() -> Item.create("バラ", 7, 0, 3, "花卸問屋A"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("1以上");
    }

    @Test
    void リードタイムが0以下の場合は例外が発生する() {
        assertThatThrownBy(() -> Item.create("バラ", 7, 10, 0, "花卸問屋A"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("1以上");
    }

    @Test
    void 仕入先名が空の場合は例外が発生する() {
        assertThatThrownBy(() -> Item.create("バラ", 7, 10, 3, ""))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("仕入先名は必須です");
    }

    @Test
    void 単品情報を更新できる() {
        Item item = Item.create("バラ（赤）", 7, 10, 3, "花卸問屋A");

        item.update("チューリップ", 5, 20, 2, "花卸問屋B");

        assertThat(item.getName()).isEqualTo("チューリップ");
        assertThat(item.getShelfLifeDays()).isEqualTo(5);
        assertThat(item.getPurchaseUnit()).isEqualTo(20);
    }
}
