"""商品ドメインのエンティティ定義。

Product, Item, Supplier, Composition の各エンティティを定義する。
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date

from apps.products.domain.value_objects import (
    ItemName,
    LeadTimeDays,
    PurchaseUnit,
    QualityRetentionDays,
)


@dataclass
class Supplier:
    """仕入先エンティティ。"""

    id: int
    name: str
    contact_info: str = ""

    def __post_init__(self) -> None:
        if not self.name:
            msg = "仕入先名は必須です"
            raise ValueError(msg)
        if len(self.name) > 100:
            msg = "仕入先名は100文字以内です"
            raise ValueError(msg)


@dataclass
class Item:
    """単品（花）エンティティ。集約ルート。"""

    id: int
    name: ItemName
    quality_retention_days: QualityRetentionDays
    purchase_unit: PurchaseUnit
    lead_time_days: LeadTimeDays
    supplier_id: int
    is_active: bool = field(default=True)

    def calculate_expiry_date(self, arrival_date: date) -> date:
        """入荷日から品質維持期限を算出する。"""
        return self.quality_retention_days.calculate_expiry(arrival_date)

    def deactivate(self) -> None:
        """単品を無効化する。"""
        self.is_active = False
