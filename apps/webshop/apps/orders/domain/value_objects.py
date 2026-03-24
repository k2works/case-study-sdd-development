"""受注ドメインの値オブジェクト。"""

from __future__ import annotations

import enum
from dataclasses import dataclass
from datetime import date


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
    CANCELLED = "cancelled"


@dataclass(frozen=True)
class DeliveryDate:
    """届け日。翌日以降のみ有効。"""

    value: date

    def __post_init__(self):
        if self.value <= date.today():
            raise ValueError("届け日は翌日以降を指定してください")


@dataclass(frozen=True)
class Message:
    """メッセージカード内容。200 文字以内。"""

    value: str

    def __post_init__(self):
        if len(self.value) > 200:
            raise ValueError("メッセージは 200 文字以内にしてください")

    def __str__(self) -> str:
        return self.value
