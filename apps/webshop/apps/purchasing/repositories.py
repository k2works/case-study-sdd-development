"""仕入管理の Repository 実装（インフラ層）。

domain/interfaces.py で定義された ABC を Django ORM で実装する。
"""

from __future__ import annotations

from apps.purchasing.domain.entities import Arrival, PurchaseOrder
from apps.purchasing.domain.interfaces import (
    ArrivalRepository,
    PurchaseOrderRepository,
)
from apps.purchasing.domain.value_objects import PurchaseOrderStatus
from apps.purchasing.models import Arrival as ArrivalModel
from apps.purchasing.models import PurchaseOrder as PurchaseOrderModel


class DjangoPurchaseOrderRepository(PurchaseOrderRepository):
    """発注 Repository の Django ORM 実装。"""

    def find_by_id(self, purchase_order_id: int) -> PurchaseOrder | None:
        try:
            obj = PurchaseOrderModel.objects.get(pk=purchase_order_id)
            return self._to_entity(obj)
        except PurchaseOrderModel.DoesNotExist:
            return None

    def find_by_status(self, status: str) -> list[PurchaseOrder]:
        objs = PurchaseOrderModel.objects.filter(status=status).order_by(
            "-ordered_at"
        )
        return [self._to_entity(obj) for obj in objs]

    def find_ordered(self) -> list[PurchaseOrder]:
        return self.find_by_status("ordered")

    def find_ordered_by_item_id(self, item_id: int) -> list[PurchaseOrder]:
        objs = PurchaseOrderModel.objects.filter(
            item_id=item_id, status="ordered"
        ).order_by("expected_arrival_date")
        return [self._to_entity(obj) for obj in objs]

    def save(self, purchase_order: PurchaseOrder) -> PurchaseOrder:
        if purchase_order.id is not None:
            obj = PurchaseOrderModel.objects.get(pk=purchase_order.id)
            obj.item_id = purchase_order.item_id
            obj.supplier_id = purchase_order.supplier_id
            obj.quantity = purchase_order.quantity
            obj.expected_arrival_date = purchase_order.expected_arrival_date
            obj.status = purchase_order.status.value
            obj.save()
        else:
            obj = PurchaseOrderModel.objects.create(
                item_id=purchase_order.item_id,
                supplier_id=purchase_order.supplier_id,
                quantity=purchase_order.quantity,
                expected_arrival_date=purchase_order.expected_arrival_date,
                status=purchase_order.status.value,
            )
        return self._to_entity(obj)

    def _to_entity(self, obj: PurchaseOrderModel) -> PurchaseOrder:
        return PurchaseOrder(
            id=obj.pk,
            item_id=obj.item_id,
            supplier_id=obj.supplier_id,
            quantity=obj.quantity,
            expected_arrival_date=obj.expected_arrival_date,
            status=PurchaseOrderStatus(obj.status),
            ordered_at=obj.ordered_at,
        )


class DjangoArrivalRepository(ArrivalRepository):
    """入荷 Repository の Django ORM 実装。"""

    def find_by_id(self, arrival_id: int) -> Arrival | None:
        try:
            obj = ArrivalModel.objects.get(pk=arrival_id)
            return self._to_entity(obj)
        except ArrivalModel.DoesNotExist:
            return None

    def find_by_purchase_order_id(
        self, purchase_order_id: int
    ) -> list[Arrival]:
        objs = ArrivalModel.objects.filter(
            purchase_order_id=purchase_order_id
        ).order_by("-arrived_at")
        return [self._to_entity(obj) for obj in objs]

    def save(self, arrival: Arrival) -> Arrival:
        if arrival.id is not None:
            obj = ArrivalModel.objects.get(pk=arrival.id)
            obj.purchase_order_id = arrival.purchase_order_id
            obj.item_id = arrival.item_id
            obj.quantity = arrival.quantity
            obj.arrived_at = arrival.arrived_at
            obj.save()
        else:
            obj = ArrivalModel.objects.create(
                purchase_order_id=arrival.purchase_order_id,
                item_id=arrival.item_id,
                quantity=arrival.quantity,
                arrived_at=arrival.arrived_at,
            )
        return self._to_entity(obj)

    def _to_entity(self, obj: ArrivalModel) -> Arrival:
        return Arrival(
            id=obj.pk,
            purchase_order_id=obj.purchase_order_id,
            item_id=obj.item_id,
            quantity=obj.quantity,
            arrived_at=obj.arrived_at,
        )
