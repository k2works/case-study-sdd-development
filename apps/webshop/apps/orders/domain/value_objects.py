"""受注ドメインの値オブジェクト。

OrderNumber, OrderStatus, DeliveryDate, Message の各値オブジェクトを定義する。
"""

from __future__ import annotations

import enum
from dataclasses import dataclass, field
from datetime import date, timedelta


@dataclass(frozen=True)
class OrderNumber:
    """注文番号。"""

    value: str

    def __post_init__(self):
        if not self.value:
            raise ValueError("注文番号は空にできません")

    def __str__(self) -> str:
        return self.value


class OrderStatus(enum.Enum):
    """注文ステータス。"""

    PENDING = "pending"
    CONFIRMED = "confirmed"
    PREPARING = "preparing"
    SHIPPED = "shipped"
    CANCELLED = "cancelled"

    @property
    def label(self) -> str:
        """日本語ラベルを返す。"""
        return _STATUS_LABELS[self]


_STATUS_LABELS = {
    OrderStatus.PENDING: "保留中",
    OrderStatus.CONFIRMED: "確定",
    OrderStatus.PREPARING: "出荷準備中",
    OrderStatus.SHIPPED: "出荷済み",
    OrderStatus.CANCELLED: "キャンセル",
}


@dataclass(frozen=True)
class DeliveryDate:
    """届け日。新規注文時は翌日以降のみ有効。"""

    value: date
    _skip_validation: bool = field(default=False, compare=False, repr=False)

    def __post_init__(self):
        if not self._skip_validation and self.value <= date.today():
            raise ValueError("届け日は翌日以降を指定してください")

    @classmethod
    def reconstruct(cls, value: date) -> DeliveryDate:
        """DB からの復元用。過去日でもバリデーションをスキップする。"""
        return cls(value=value, _skip_validation=True)

    def change_deadline(self) -> date:
        """変更・キャンセル期限（届け日の 3 日前）を返す。"""
        return self.value - timedelta(days=3)


@dataclass(frozen=True)
class Message:
    """メッセージカード内容。200 文字以内。"""

    value: str

    def __post_init__(self):
        if len(self.value) > 200:
            raise ValueError("メッセージは 200 文字以内にしてください")

    def __str__(self) -> str:
        return self.value
