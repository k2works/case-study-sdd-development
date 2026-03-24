"""受注管理のアプリケーションサービス。"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date
from decimal import Decimal

from apps.orders.domain.entities import DeliveryAddress, Order, OrderLine
from apps.orders.domain.interfaces import OrderRepository
from apps.orders.domain.value_objects import DeliveryDate, Message, OrderNumber


@dataclass
class PlaceOrderCommand:
    """注文作成コマンド。"""

    product_id: int
    product_name: str
    unit_price: Decimal
    quantity: int
    delivery_date: date
    recipient_name: str
    postal_code: str
    address: str
    phone: str
    message: str = ""


class OrderService:
    """注文のアプリケーションサービス。"""

    def __init__(self, order_repo: OrderRepository):
        self._order_repo = order_repo

    def place_order(self, command: PlaceOrderCommand) -> Order:
        """注文を作成し確定する。"""
        order_number = self._order_repo.next_order_number()
        order = Order(
            id=None,
            order_number=OrderNumber(order_number),
            delivery_date=DeliveryDate(command.delivery_date),
            delivery_address=DeliveryAddress(
                recipient_name=command.recipient_name,
                postal_code=command.postal_code,
                address=command.address,
                phone=command.phone,
            ),
            message=Message(command.message),
            lines=[
                OrderLine(
                    product_id=command.product_id,
                    product_name=command.product_name,
                    unit_price=command.unit_price,
                    quantity=command.quantity,
                ),
            ],
        )
        order.confirm()
        return self._order_repo.save(order)

    def find_order(self, order_id: int) -> Order | None:
        """ID で注文を取得する。"""
        return self._order_repo.find_by_id(order_id)

    def find_order_by_number(self, order_number: str) -> Order | None:
        """注文番号で注文を取得する。"""
        return self._order_repo.find_by_order_number(order_number)
