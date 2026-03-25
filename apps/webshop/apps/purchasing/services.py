"""仕入管理のアプリケーションサービス。"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date

from django.db import transaction

from apps.inventory.domain.entities import StockLot
from apps.inventory.domain.interfaces import StockLotRepository
from apps.inventory.domain.value_objects import ExpiryDate, StockLotStatus
from apps.purchasing.domain.entities import Arrival, PurchaseOrder
from apps.purchasing.domain.interfaces import (
    ArrivalRepository,
    PurchaseOrderRepository,
)
from apps.purchasing.domain.value_objects import PurchaseOrderStatus


@dataclass
class PlacePurchaseOrderCommand:
    """発注作成コマンド。"""

    item_id: int
    supplier_id: int
    quantity: int
    expected_arrival_date: date


@dataclass
class ReceiveArrivalCommand:
    """入荷受入コマンド。"""

    purchase_order_id: int
    quantity: int
    arrived_at: date
    quality_retention_days: int


class PurchasingService:
    """仕入管理のアプリケーションサービス。"""

    def __init__(
        self,
        po_repo: PurchaseOrderRepository,
        arrival_repo: ArrivalRepository,
        stock_lot_repo: StockLotRepository,
    ):
        self._po_repo = po_repo
        self._arrival_repo = arrival_repo
        self._stock_lot_repo = stock_lot_repo

    def place_order(self, command: PlacePurchaseOrderCommand) -> PurchaseOrder:
        """発注を登録する。"""
        po = PurchaseOrder(
            id=None,
            item_id=command.item_id,
            supplier_id=command.supplier_id,
            quantity=command.quantity,
            expected_arrival_date=command.expected_arrival_date,
            status=PurchaseOrderStatus.ORDERED,
            ordered_at=None,
        )
        return self._po_repo.save(po)

    @transaction.atomic
    def receive_arrival(self, command: ReceiveArrivalCommand) -> Arrival:
        """入荷を受け入れ、在庫ロットを作成する。"""
        po = self._po_repo.find_by_id(command.purchase_order_id)
        if po is None:
            raise ValueError("発注が見つかりません")

        # 入荷を記録
        arrival = Arrival(
            id=None,
            purchase_order_id=po.id,
            item_id=po.item_id,
            quantity=command.quantity,
            arrived_at=command.arrived_at,
        )
        saved_arrival = self._arrival_repo.save(arrival)

        # 発注を入荷済みに遷移
        po.receive()
        self._po_repo.save(po)

        # 在庫ロットを作成
        expiry_date = ExpiryDate.calculate(
            arrived_at=command.arrived_at,
            retention_days=command.quality_retention_days,
        )
        stock_lot = StockLot(
            id=None,
            item_id=po.item_id,
            quantity=command.quantity,
            remaining_quantity=command.quantity,
            arrived_at=command.arrived_at,
            expiry_date=expiry_date,
            status=StockLotStatus.AVAILABLE,
        )
        self._stock_lot_repo.save(stock_lot)

        return saved_arrival

    def list_ordered(self) -> list[PurchaseOrder]:
        """発注済みの一覧を取得する。"""
        return self._po_repo.find_ordered()

    def find_purchase_order(
        self, purchase_order_id: int
    ) -> PurchaseOrder | None:
        """発注を取得する。"""
        return self._po_repo.find_by_id(purchase_order_id)

    def list_ordered_by_item(self, item_id: int) -> list[PurchaseOrder]:
        """単品の発注済み一覧を取得する。"""
        return self._po_repo.find_ordered_by_item_id(item_id)
