"""在庫ドメインの Repository インターフェース。"""

from __future__ import annotations

from abc import ABC, abstractmethod
from datetime import date

from apps.inventory.domain.entities import StockLot


class StockLotRepository(ABC):
    """在庫ロット Repository の抽象インターフェース。"""

    @abstractmethod
    def find_by_id(self, stock_lot_id: int) -> StockLot | None:
        """ID で在庫ロットを取得する。"""

    @abstractmethod
    def find_by_item_id(self, item_id: int) -> list[StockLot]:
        """単品 ID で在庫ロットを検索する。"""

    @abstractmethod
    def find_active_by_item_id(self, item_id: int, as_of: date) -> list[StockLot]:
        """単品 ID で期限内の在庫ロットを検索する。"""

    @abstractmethod
    def save(self, stock_lot: StockLot) -> StockLot:
        """在庫ロットを永続化する。id が None なら新規作成、それ以外は更新。"""
