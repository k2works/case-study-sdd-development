"""受注ドメインのエンティティ定義。

DeliveryAddress, OrderLine, Order の各エンティティを定義する。
Order が集約ルートとして注文のライフサイクルを管理する。
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date
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
