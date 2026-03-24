"""受注管理の Repository 実装（インフラ層）。"""

from __future__ import annotations

import uuid
from datetime import date
from decimal import Decimal

from apps.orders.domain.entities import DeliveryAddress, Order, OrderLine
from apps.orders.domain.interfaces import OrderRepository
from apps.orders.domain.value_objects import (
    DeliveryDate,
    Message,
    OrderNumber,
    OrderStatus,
)
from apps.orders.models import Order as OrderModel
from apps.orders.models import OrderLine as OrderLineModel


class DjangoOrderRepository(OrderRepository):
    """注文 Repository の Django ORM 実装。"""

    def find_by_id(self, order_id: int) -> Order | None:
        try:
            obj = OrderModel.objects.prefetch_related("lines").get(pk=order_id)
            return self._to_entity(obj)
        except OrderModel.DoesNotExist:
            return None

    def find_by_order_number(self, order_number: str) -> Order | None:
        try:
            obj = OrderModel.objects.prefetch_related("lines").get(
                order_number=order_number
            )
            return self._to_entity(obj)
        except OrderModel.DoesNotExist:
            return None

    def save(self, order: Order) -> Order:
        if order.id is not None:
            obj = OrderModel.objects.get(pk=order.id)
            obj.status = order.status.value
            obj.delivery_date = order.delivery_date.value
            obj.recipient_name = order.delivery_address.recipient_name
            obj.postal_code = order.delivery_address.postal_code
            obj.address = order.delivery_address.address
            obj.phone = order.delivery_address.phone
            obj.message = str(order.message)
            obj.save()
        else:
            obj = OrderModel.objects.create(
                order_number=str(order.order_number),
                status=order.status.value,
                delivery_date=order.delivery_date.value,
                recipient_name=order.delivery_address.recipient_name,
                postal_code=order.delivery_address.postal_code,
                address=order.delivery_address.address,
                phone=order.delivery_address.phone,
                message=str(order.message),
            )
        # 明細の同期
        OrderLineModel.objects.filter(order=obj).delete()
        for line in order.lines:
            OrderLineModel.objects.create(
                order=obj,
                product_id=line.product_id,
                product_name=line.product_name,
                unit_price=line.unit_price,
                quantity=line.quantity,
            )
        return self._to_entity(obj)

    def next_order_number(self) -> str:
        today = date.today().strftime("%Y%m%d")
        suffix = uuid.uuid4().hex[:6].upper()
        return f"ORD-{today}-{suffix}"

    def _to_entity(self, obj: OrderModel) -> Order:
        lines = [
            OrderLine(
                product_id=line.product_id,
                product_name=line.product_name,
                unit_price=Decimal(str(line.unit_price)),
                quantity=line.quantity,
            )
            for line in obj.lines.all()
        ]
        return Order(
            id=obj.pk,
            order_number=OrderNumber(obj.order_number),
            status=OrderStatus(obj.status),
            delivery_date=DeliveryDate(obj.delivery_date),
            delivery_address=DeliveryAddress(
                recipient_name=obj.recipient_name,
                postal_code=obj.postal_code,
                address=obj.address,
                phone=obj.phone,
            ),
            message=Message(obj.message),
            lines=lines,
        )
