package com.frerememoire.webshop.domain.customer;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class DeliveryDestinationTest {

    @Test
    void 正常に届け先を作成できる() {
        DeliveryDestination dest = DeliveryDestination.create(
                1L, "山田花子", "123-4567", "東京都渋谷区1-1-1", "090-9876-5432");

        assertThat(dest.getCustomerId()).isEqualTo(1L);
        assertThat(dest.getRecipientName()).isEqualTo("山田花子");
        assertThat(dest.getPostalCode()).isEqualTo("123-4567");
        assertThat(dest.getAddress()).isEqualTo("東京都渋谷区1-1-1");
        assertThat(dest.getPhone()).isEqualTo("090-9876-5432");
    }

    @Test
    void 電話番号なしで届け先を作成できる() {
        DeliveryDestination dest = DeliveryDestination.create(
                1L, "山田花子", "123-4567", "東京都渋谷区1-1-1", null);

        assertThat(dest.getPhone()).isNull();
    }

    @Test
    void 得意先IDがnullの場合は例外が発生する() {
        assertThatThrownBy(() -> DeliveryDestination.create(
                null, "山田花子", "123-4567", "東京都渋谷区1-1-1", null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("得意先ID");
    }

    @Test
    void 届け先氏名が空の場合は例外が発生する() {
        assertThatThrownBy(() -> DeliveryDestination.create(
                1L, "", "123-4567", "東京都渋谷区1-1-1", null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("届け先氏名");
    }

    @Test
    void 郵便番号が空の場合は例外が発生する() {
        assertThatThrownBy(() -> DeliveryDestination.create(
                1L, "山田花子", "", "東京都渋谷区1-1-1", null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("郵便番号");
    }

    @Test
    void 住所が空の場合は例外が発生する() {
        assertThatThrownBy(() -> DeliveryDestination.create(
                1L, "山田花子", "123-4567", "", null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("住所");
    }

    @Test
    void 住所がnullの場合は例外が発生する() {
        assertThatThrownBy(() -> DeliveryDestination.create(
                1L, "山田花子", "123-4567", null, null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("住所");
    }
}
