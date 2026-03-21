package com.frerememoire.webshop.domain.order;

import java.util.Objects;

public class Message {

    private static final int MAX_LENGTH = 200;

    private final String value;

    public Message(String value) {
        validate(value);
        this.value = value;
    }

    private void validate(String value) {
        if (value != null && value.length() > MAX_LENGTH) {
            throw new IllegalArgumentException(
                    "メッセージは%d文字以内で入力してください".formatted(MAX_LENGTH));
        }
    }

    public String getValue() {
        return value;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Message message = (Message) o;
        return Objects.equals(value, message.value);
    }

    @Override
    public int hashCode() {
        return Objects.hash(value);
    }
}
