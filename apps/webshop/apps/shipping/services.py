"""出荷管理のアプリケーションサービス。"""

from __future__ import annotations

import logging
from datetime import date, timedelta

from django.utils import timezone

from apps.orders.domain.interfaces import OrderRepository
from apps.products.models import Composition
from apps.shipping.domain.entities import (
    BundlingItem,
    BundlingSummary,
    BundlingTarget,
    Shipment,
)
from apps.shipping.domain.interfaces import ShipmentRepository

logger = logging.getLogger(__name__)


class ShippingService:
    """出荷管理のアプリケーションサービス。"""

    def __init__(
        self,
        order_repo: OrderRepository,
        shipment_repo: ShipmentRepository,
    ):
        self._order_repo = order_repo
        self._shipment_repo = shipment_repo

    def get_bundling_summary(self, shipping_date: date) -> BundlingSummary:
        """結束対象のサマリーを取得する。

        出荷日 = 届け日 - 1 なので、delivery_date = shipping_date + 1
        """
        delivery_date = shipping_date + timedelta(days=1)
        orders = self._order_repo.find_all(
            status="confirmed",
            date_from=delivery_date,
            date_to=delivery_date,
        )

        targets: list[BundlingTarget] = []
        item_totals: dict[str, int] = {}

        for order in orders:
            if order.id is None:
                continue
            order_items: list[BundlingItem] = []
            for line in order.lines:
                compositions = Composition.objects.filter(
                    product_id=line.product_id
                ).select_related("item")
                for comp in compositions:
                    bi = BundlingItem(
                        item_name=comp.item.name,
                        quantity=comp.quantity * line.quantity,
                    )
                    order_items.append(bi)
                    item_totals[bi.item_name] = (
                        item_totals.get(bi.item_name, 0) + bi.quantity
                    )

            targets.append(
                BundlingTarget(
                    order_id=order.id,
                    order_number=str(order.order_number),
                    product_name=order.lines[0].product_name if order.lines else "",
                    recipient_name=(order.delivery_address.recipient_name),
                    items=order_items,
                )
            )

        return BundlingSummary(
            shipping_date=shipping_date,
            item_totals=item_totals,
            targets=targets,
        )

    def ship_order(self, order_id: int) -> Shipment:
        """注文を出荷処理する。"""
        order = self._order_repo.find_by_id(order_id)
        if order is None:
            raise ValueError("注文が見つかりません")

        # ステータス遷移: CONFIRMED → PREPARING → SHIPPED
        order.start_preparing()
        order.ship()
        self._order_repo.save(order)

        # 出荷記録を作成
        now = timezone.now()
        if order.id is None:
            raise ValueError("注文 ID が不正です")
        shipment = Shipment(
            id=None,
            order_id=order.id,
            shipped_at=now,
            notified_at=now,
        )
        saved = self._shipment_repo.save(shipment)

        # 通知（将来 SES に置換）
        logger.info(
            "出荷通知: 注文 %s を出荷しました（届け先: %s）",
            order.order_number,
            order.delivery_address.recipient_name,
        )

        return saved

    def list_shippable_orders(self, shipping_date: date):
        """出荷対象の注文一覧を取得する。"""
        delivery_date = shipping_date + timedelta(days=1)
        return self._order_repo.find_all(
            status="confirmed",
            date_from=delivery_date,
            date_to=delivery_date,
        )
