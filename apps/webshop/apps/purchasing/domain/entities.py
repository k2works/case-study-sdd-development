"""仕入ドメインのエンティティ定義。

PurchaseOrder（発注集約ルート）と Arrival（入荷集約ルート）を定義する。
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date, datetime

from apps.purchasing.domain.value_objects import PurchaseOrderStatus


@dataclass
class PurchaseOrder:
    """発注集約ルート。仕入先への花材の発注。"""

    id: int | None
    item_id: int
    supplier_id: int
    quantity: int
    expected_arrival_date: date
    status: PurchaseOrderStatus
    ordered_at: datetime

    def __post_init__(self):
        if self.quantity < 1:
            raise ValueError("発注数量は 1 以上にしてください")
        if self.expected_arrival_date <= date.today():
            raise ValueError("入荷予定日は未来の日付を指定してください")

    def receive(self) -> None:
        """入荷済みに遷移する。"""
        if self.status != PurchaseOrderStatus.ORDERED:
            raise ValueError("発注済みの注文のみ入荷処理できます")
        self.status = PurchaseOrderStatus.ARRIVED

    def cancel(self) -> None:
        """発注をキャンセルする。"""
        if self.status != PurchaseOrderStatus.ORDERED:
            raise ValueError("発注済みの注文のみキャンセルできます")
        self.status = PurchaseOrderStatus.CANCELLED


@dataclass
class Arrival:
    """入荷集約ルート。仕入先からの花材の入荷実績。"""

    id: int | None
    purchase_order_id: int
    item_id: int
    quantity: int
    arrived_at: date

    def __post_init__(self):
        if self.quantity < 1:
            raise ValueError("入荷数量は 1 以上にしてください")

    def quantity_variance(self, ordered_quantity: int) -> int:
        """発注数量との差異を返す。正=超過、負=不足。"""
        return self.quantity - ordered_quantity
