"""仕入ドメインの Repository インターフェース。"""

from __future__ import annotations

from abc import ABC, abstractmethod

from apps.purchasing.domain.entities import Arrival, PurchaseOrder


class PurchaseOrderRepository(ABC):
    """発注 Repository の抽象インターフェース。"""

    @abstractmethod
    def find_by_id(self, purchase_order_id: int) -> PurchaseOrder | None:
        """ID で発注を取得する。"""

    @abstractmethod
    def find_by_status(self, status: str) -> list[PurchaseOrder]:
        """ステータスで発注を検索する。"""

    @abstractmethod
    def find_ordered(self) -> list[PurchaseOrder]:
        """発注済み（未入荷）の発注を取得する。"""

    @abstractmethod
    def find_ordered_by_item_id(self, item_id: int) -> list[PurchaseOrder]:
        """単品 ID で発注済みの発注を検索する。"""

    @abstractmethod
    def save(self, purchase_order: PurchaseOrder) -> PurchaseOrder:
        """発注を永続化する。"""


class ArrivalRepository(ABC):
    """入荷 Repository の抽象インターフェース。"""

    @abstractmethod
    def find_by_id(self, arrival_id: int) -> Arrival | None:
        """ID で入荷を取得する。"""

    @abstractmethod
    def find_by_purchase_order_id(
        self, purchase_order_id: int
    ) -> list[Arrival]:
        """発注 ID で入荷を検索する。"""

    @abstractmethod
    def save(self, arrival: Arrival) -> Arrival:
        """入荷を永続化する。"""
