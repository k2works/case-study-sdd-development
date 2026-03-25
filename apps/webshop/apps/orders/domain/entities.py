"""受注ドメインのエンティティ定義。

DeliveryAddress, OrderLine, Order の各エンティティを定義する。
Order が集約ルートとして注文のライフサイクルを管理する。
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date, timedelta
from decimal import Decimal

from apps.orders.domain.value_objects import (
    DeliveryDate,
    Message,
    OrderNumber,
    OrderStatus,
)


@dataclass
class DeliveryAddress:
    """届け先。"""

    recipient_name: str
    postal_code: str
    address: str
    phone: str

    def __post_init__(self):
        if not self.recipient_name:
            raise ValueError("届け先氏名は必須です")
        if not self.address:
            raise ValueError("届け先住所は必須です")


@dataclass
class OrderLine:
    """注文明細。"""

    product_id: int
    product_name: str
    unit_price: Decimal
    quantity: int

    def __post_init__(self):
        if self.quantity < 1:
            raise ValueError("数量は 1 以上にしてください")

    @property
    def subtotal(self) -> Decimal:
        return self.unit_price * self.quantity


@dataclass
class Order:
    """注文集約ルート。"""

    id: int | None
    order_number: OrderNumber
    delivery_date: DeliveryDate
    delivery_address: DeliveryAddress
    message: Message
    lines: list[OrderLine]
    status: OrderStatus = field(default=OrderStatus.PENDING)

    def __post_init__(self):
        if not self.lines:
            raise ValueError("注文には 1 つ以上の明細が必要です")

    @property
    def total_amount(self) -> Decimal:
        return sum(line.subtotal for line in self.lines)

    def confirm(self) -> None:
        if self.status != OrderStatus.PENDING:
            raise ValueError("保留中の注文のみ確定できます")
        self.status = OrderStatus.CONFIRMED

    def cancel(self, current_date: date) -> None:
        """注文をキャンセルする。届け日 3 日前まで可能。"""
        if self.status == OrderStatus.CANCELLED:
            raise ValueError("既にキャンセル済みです")
        if self.status not in (OrderStatus.PENDING, OrderStatus.CONFIRMED):
            raise ValueError("この注文はキャンセルできません")
        if current_date > self.delivery_date.change_deadline():
            raise ValueError("キャンセル期限を過ぎています")
        self.status = OrderStatus.CANCELLED

    def start_preparing(self) -> None:
        """出荷準備を開始する。CONFIRMED → PREPARING。"""
        if self.status != OrderStatus.CONFIRMED:
            raise ValueError("確定済みの注文のみ出荷準備できます")
        self.status = OrderStatus.PREPARING

    def ship(self) -> None:
        """出荷する。PREPARING → SHIPPED。"""
        if self.status != OrderStatus.PREPARING:
            raise ValueError("出荷準備中の注文のみ出荷できます")
        self.status = OrderStatus.SHIPPED

    def change_delivery_date(
        self, new_date: DeliveryDate, current_date: date
    ) -> None:
        """届け日を変更する。届け日 3 日前まで可能。"""
        if self.status == OrderStatus.CANCELLED:
            raise ValueError("キャンセル済みの注文は変更できません")
        if self.status in (OrderStatus.PREPARING, OrderStatus.SHIPPED):
            raise ValueError("出荷準備以降の注文は変更できません")
        if current_date > self.delivery_date.change_deadline():
            raise ValueError("変更期限を過ぎています")
        object.__setattr__(self, "delivery_date", new_date)

    @property
    def shipping_date(self) -> date:
        """出荷日（届け日の前日）を返す。"""
        return self.delivery_date.value - timedelta(days=1)
