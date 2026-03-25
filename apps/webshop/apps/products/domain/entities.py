"""商品ドメインのエンティティ定義。

Product, Item, Supplier, Composition の各エンティティを定義する。
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date

from apps.products.domain.value_objects import (
    ItemName,
    LeadTimeDays,
    Price,
    ProductName,
    PurchaseUnit,
    QualityRetentionDays,
)


@dataclass
class Supplier:
    """仕入先エンティティ。"""

    id: int | None
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

    id: int | None
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


@dataclass
class Composition:
    """商品構成エンティティ。花束を構成する単品と数量。"""

    product_id: int
    item_id: int
    quantity: int

    def __post_init__(self) -> None:
        if self.quantity < 1:
            msg = "数量は1以上です"
            raise ValueError(msg)


@dataclass
class Product:
    """商品（花束）エンティティ。集約ルート。"""

    id: int | None
    name: ProductName
    description: str
    price: Price
    image_url: str = ""
    is_active: bool = field(default=True)
    compositions: list[Composition] = field(default_factory=list)

    def add_composition(self, item_id: int, quantity: int) -> None:
        """構成に単品を追加する。同じ単品の重複は不可。"""
        if self.id is None:
            msg = "保存前の商品には構成を追加できません"
            raise ValueError(msg)
        if any(c.item_id == item_id for c in self.compositions):
            msg = f"単品 {item_id} は既に構成に含まれています"
            raise ValueError(msg)
        self.compositions.append(
            Composition(product_id=self.id, item_id=item_id, quantity=quantity)
        )

    def remove_composition(self, item_id: int) -> None:
        """構成から単品を削除する。"""
        self.compositions = [c for c in self.compositions if c.item_id != item_id]

    def get_required_items(self) -> dict[int, int]:
        """構成単品の必要数量を返す。{item_id: quantity}"""
        return {c.item_id: c.quantity for c in self.compositions}

    def deactivate(self) -> None:
        """商品を無効化する。"""
        self.is_active = False
