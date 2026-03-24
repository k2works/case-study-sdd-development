"""在庫ドメインのエンティティ定義。

StockLot（在庫ロット集約ルート）と DailyForecast（日次在庫予測）を定義する。
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date

from apps.inventory.domain.value_objects import ExpiryDate, StockLotStatus


@dataclass
class StockLot:
    """在庫ロット集約ルート。入荷単位で管理される在庫。"""

    id: int | None
    item_id: int
    quantity: int
    remaining_quantity: int
    arrived_at: date
    expiry_date: ExpiryDate
    status: StockLotStatus

    def __post_init__(self):
        if self.quantity < 1:
            raise ValueError("数量は 1 以上にしてください")
        if self.remaining_quantity < 0:
            raise ValueError("残数量は 0 以上にしてください")

    def allocate(self, qty: int) -> int:
        """指定数量を引当てる。実際に引当てた数量を返す。"""
        actual = min(qty, self.remaining_quantity)
        self.remaining_quantity -= actual
        if self.remaining_quantity == 0:
            self.status = StockLotStatus.DEPLETED
        return actual

    def deallocate(self, qty: int) -> None:
        """引当を解除し残数量を戻す。"""
        if self.remaining_quantity + qty > self.quantity:
            raise ValueError("元の数量を超えて引当解除できません")
        self.remaining_quantity += qty
        if self.status == StockLotStatus.DEPLETED and self.remaining_quantity > 0:
            self.status = StockLotStatus.AVAILABLE

    def is_near_expiry(self, current_date: date) -> bool:
        """品質維持期限が間近（残り 2 日以内）かを判定する。"""
        return self.expiry_date.is_near_expiry(current_date)

    def is_expired(self, current_date: date) -> bool:
        """品質維持期限を超過しているかを判定する。"""
        return self.expiry_date.days_remaining(current_date) < 0


@dataclass(frozen=True)
class DailyForecast:
    """日次在庫予測。在庫推移表示のデータ構造。"""

    date: date
    stock_remaining: int
    outgoing_planned: int
    incoming_planned: int
    expiring: int
