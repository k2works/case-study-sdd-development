package com.frerememoire.webshop.domain.order;

import java.time.LocalDate;
import java.util.Objects;

public class DeliveryDate {

    private static final int MIN_DAYS_AHEAD = 1;
    private static final int MAX_DAYS_AHEAD = 30;

    private final LocalDate value;

    public DeliveryDate(LocalDate value) {
        validate(value);
        this.value = value;
    }

    private DeliveryDate(LocalDate value, boolean skipValidation) {
        this.value = value;
    }

    /**
     * DB からの復元用。バリデーションをスキップする。
     */
    public static DeliveryDate reconstruct(LocalDate value) {
        return new DeliveryDate(value, true);
    }

    private void validate(LocalDate value) {
        if (value == null) {
            throw new IllegalArgumentException("届け日は必須です");
        }
        LocalDate today = LocalDate.now();
        LocalDate earliest = today.plusDays(MIN_DAYS_AHEAD);
        LocalDate latest = today.plusDays(MAX_DAYS_AHEAD);

        if (value.isBefore(earliest)) {
            throw new IllegalArgumentException("届け日は翌日以降を指定してください");
        }
        if (value.isAfter(latest)) {
            throw new IllegalArgumentException("届け日は30日後までの範囲で指定してください");
        }
    }

    public LocalDate getValue() {
        return value;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        DeliveryDate that = (DeliveryDate) o;
        return Objects.equals(value, that.value);
    }

    @Override
    public int hashCode() {
        return Objects.hash(value);
    }
}
