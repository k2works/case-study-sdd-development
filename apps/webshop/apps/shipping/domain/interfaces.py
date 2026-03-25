"""出荷ドメインの Repository インターフェース。"""

from __future__ import annotations

from abc import ABC, abstractmethod

from apps.shipping.domain.entities import Shipment


class ShipmentRepository(ABC):
    """出荷 Repository の抽象インターフェース。"""

    @abstractmethod
    def find_by_id(self, shipment_id: int) -> Shipment | None:
        """ID で出荷を取得する。"""

    @abstractmethod
    def find_by_order_id(self, order_id: int) -> Shipment | None:
        """注文 ID で出荷を取得する。"""

    @abstractmethod
    def save(self, shipment: Shipment) -> Shipment:
        """出荷を永続化する。"""
