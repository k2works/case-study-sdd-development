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
    """注文ステータス。

    IT3 現在: PENDING → CONFIRMED → CANCELLED の 3 状態。
    IT4 以降: PREPARING, SHIPPED を追加予定（ADR-001 参照）。
    """

    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"


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
