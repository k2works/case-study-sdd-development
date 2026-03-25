"""出荷ドメインのエンティティ。"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date, datetime


@dataclass
class Shipment:
    """出荷集約ルート。受注に対する出荷記録。"""

    id: int | None
    order_id: int
    shipped_at: datetime
    notified_at: datetime | None = None

    def mark_notified(self, notified_at: datetime) -> None:
        """通知済みにする。"""
        self.notified_at = notified_at


@dataclass(frozen=True)
class BundlingItem:
    """結束に必要な花材と数量。"""

    item_name: str
    quantity: int


@dataclass(frozen=True)
class BundlingTarget:
    """結束対象の注文情報。"""

    order_id: int
    order_number: str
    product_name: str
    recipient_name: str
    items: list[BundlingItem] = field(default_factory=list)


@dataclass(frozen=True)
class BundlingSummary:
    """結束対象のサマリー。"""

    shipping_date: date
    item_totals: dict[str, int]
    targets: list[BundlingTarget]
