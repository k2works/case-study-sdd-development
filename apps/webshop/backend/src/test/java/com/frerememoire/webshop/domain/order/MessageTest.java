package com.frerememoire.webshop.domain.order;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class MessageTest {

    @Test
    void 正常なメッセージを作成できる() {
        Message message = new Message("お誕生日おめでとうございます。");

        assertThat(message.getValue()).isEqualTo("お誕生日おめでとうございます。");
    }

    @Test
    void 空文字のメッセージを作成できる() {
        Message message = new Message("");

        assertThat(message.getValue()).isEmpty();
    }

    @Test
    void nullのメッセージを作成できる() {
        Message message = new Message(null);

        assertThat(message.getValue()).isNull();
    }

    @Test
    void 二百文字のメッセージを作成できる() {
        String text = "あ".repeat(200);

        Message message = new Message(text);

        assertThat(message.getValue()).hasSize(200);
    }

    @Test
    void 二百一文字のメッセージは作成できない() {
        String text = "あ".repeat(201);

        assertThatThrownBy(() -> new Message(text))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("200文字");
    }

    @Test
    void 同じ内容のMessageは等しい() {
        Message m1 = new Message("テスト");
        Message m2 = new Message("テスト");

        assertThat(m1).isEqualTo(m2);
        assertThat(m1.hashCode()).isEqualTo(m2.hashCode());
    }
}
