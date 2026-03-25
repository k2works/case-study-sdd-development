"""出荷管理の Repository 実装（インフラ層）。"""

from __future__ import annotations

from apps.shipping.domain.entities import Shipment
from apps.shipping.domain.interfaces import ShipmentRepository
from apps.shipping.models import Shipment as ShipmentModel


class DjangoShipmentRepository(ShipmentRepository):
    """出荷 Repository の Django ORM 実装。"""

    def find_by_id(self, shipment_id: int) -> Shipment | None:
        try:
            obj = ShipmentModel.objects.get(pk=shipment_id)
            return self._to_entity(obj)
        except ShipmentModel.DoesNotExist:
            return None

    def find_by_order_id(self, order_id: int) -> Shipment | None:
        try:
            obj = ShipmentModel.objects.get(order_id=order_id)
            return self._to_entity(obj)
        except ShipmentModel.DoesNotExist:
            return None

    def save(self, shipment: Shipment) -> Shipment:
        if shipment.id is not None:
            obj = ShipmentModel.objects.get(pk=shipment.id)
            obj.order_id = shipment.order_id
            obj.shipped_at = shipment.shipped_at
            obj.notified_at = shipment.notified_at
            obj.save()
        else:
            obj = ShipmentModel.objects.create(
                order_id=shipment.order_id,
                shipped_at=shipment.shipped_at,
                notified_at=shipment.notified_at,
            )
        return self._to_entity(obj)

    def _to_entity(self, obj: ShipmentModel) -> Shipment:
        return Shipment(
            id=obj.pk,
            order_id=obj.order_id,
            shipped_at=obj.shipped_at,
            notified_at=obj.notified_at,
        )
