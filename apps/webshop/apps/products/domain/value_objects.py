"""商品ドメインの値オブジェクト定義。

ProductName, Price, ItemName, QualityRetentionDays,
PurchaseUnit, LeadTimeDays の各値オブジェクトを定義する。
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date, timedelta


@dataclass(frozen=True)
class ItemName:
    """単品名。1〜100 文字。"""

    value: str

    def __post_init__(self) -> None:
        if not self.value or not isinstance(self.value, str):
            msg = "単品名は必須です"
            raise ValueError(msg)
        if len(self.value) > 100:
            msg = "単品名は100文字以内です"
            raise ValueError(msg)

    def __str__(self) -> str:
        return self.value


@dataclass(frozen=True)
class QualityRetentionDays:
    """品質維持日数。1 以上の整数。"""

    value: int

    def __post_init__(self) -> None:
        if self.value < 1:
            msg = "品質維持日数は1以上です"
            raise ValueError(msg)

    def calculate_expiry(self, arrived_at: date) -> date:
        """入荷日から品質維持期限を算出する。"""
        return arrived_at + timedelta(days=self.value - 1)

    def is_near_expiry(self, arrived_at: date, current_date: date) -> bool:
        """品質維持期限まで残り 2 日以内かを判定する。"""
        expiry = self.calculate_expiry(arrived_at)
        return 0 <= (expiry - current_date).days <= 2


@dataclass(frozen=True)
class PurchaseUnit:
    """購入単位（本）。1 以上の整数。"""

    value: int

    def __post_init__(self) -> None:
        if self.value < 1:
            msg = "購入単位は1以上です"
            raise ValueError(msg)


@dataclass(frozen=True)
class LeadTimeDays:
    """リードタイム（日）。0 以上の整数。"""

    value: int

    def __post_init__(self) -> None:
        if self.value < 0:
            msg = "リードタイムは0以上です"
            raise ValueError(msg)

    def earliest_delivery_date(self, order_date: date) -> date:
        """注文日から最短届け日を算出する。"""
        return order_date + timedelta(days=self.value)
