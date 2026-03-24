"""在庫管理の Repository 実装（インフラ層）。

domain/interfaces.py で定義された ABC を Django ORM で実装する。
"""

from __future__ import annotations

from datetime import date

from apps.inventory.domain.entities import StockLot
from apps.inventory.domain.interfaces import StockLotRepository
from apps.inventory.domain.value_objects import ExpiryDate, StockLotStatus
from apps.inventory.models import StockLot as StockLotModel


class DjangoStockLotRepository(StockLotRepository):
    """在庫ロット Repository の Django ORM 実装。"""

    def find_by_id(self, stock_lot_id: int) -> StockLot | None:
        try:
            obj = StockLotModel.objects.get(pk=stock_lot_id)
            return self._to_entity(obj)
        except StockLotModel.DoesNotExist:
            return None

    def find_by_item_id(self, item_id: int) -> list[StockLot]:
        objs = StockLotModel.objects.filter(item_id=item_id).order_by("expiry_date")
        return [self._to_entity(obj) for obj in objs]

    def find_active_by_item_id(self, item_id: int, as_of: date) -> list[StockLot]:
        objs = (
            StockLotModel.objects.filter(
                item_id=item_id,
                expiry_date__gt=as_of,
                remaining_quantity__gt=0,
            )
            .exclude(status="expired")
            .order_by("expiry_date")
        )
        return [self._to_entity(obj) for obj in objs]

    def save(self, stock_lot: StockLot) -> StockLot:
        if stock_lot.id is not None:
            obj = StockLotModel.objects.get(pk=stock_lot.id)
            obj.item_id = stock_lot.item_id
            obj.quantity = stock_lot.quantity
            obj.remaining_quantity = stock_lot.remaining_quantity
            obj.arrived_at = stock_lot.arrived_at
            obj.expiry_date = stock_lot.expiry_date.value
            obj.status = stock_lot.status.value
            obj.save()
        else:
            obj = StockLotModel.objects.create(
                item_id=stock_lot.item_id,
                quantity=stock_lot.quantity,
                remaining_quantity=stock_lot.remaining_quantity,
                arrived_at=stock_lot.arrived_at,
                expiry_date=stock_lot.expiry_date.value,
                status=stock_lot.status.value,
            )
        return self._to_entity(obj)

    def _to_entity(self, obj: StockLotModel) -> StockLot:
        return StockLot(
            id=obj.pk,
            item_id=obj.item_id,
            quantity=obj.quantity,
            remaining_quantity=obj.remaining_quantity,
            arrived_at=obj.arrived_at,
            expiry_date=ExpiryDate(obj.expiry_date),
            status=StockLotStatus(obj.status),
        )
