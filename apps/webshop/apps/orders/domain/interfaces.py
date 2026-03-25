"""受注ドメインの Repository インターフェース。"""

from __future__ import annotations

from abc import ABC, abstractmethod
from datetime import date

from apps.orders.domain.entities import DeliveryAddress, Order


class OrderRepository(ABC):
    """注文 Repository の抽象インターフェース。"""

    @abstractmethod
    def find_by_id(self, order_id: int) -> Order | None:
        """ID で注文を取得する。"""

    @abstractmethod
    def find_by_order_number(self, order_number: str) -> Order | None:
        """注文番号で注文を取得する。"""

    @abstractmethod
    def find_all(
        self,
        *,
        status: str | None = None,
        date_from: date | None = None,
        date_to: date | None = None,
    ) -> list[Order]:
        """注文一覧を取得する。ステータス・日付範囲でフィルタ可能。"""

    @abstractmethod
    def search_by_order_number(self, query: str) -> list[Order]:
        """注文番号の部分一致で検索する。"""

    @abstractmethod
    def find_recent_addresses(self) -> list[DeliveryAddress]:
        """過去の注文から重複を除いた届け先一覧を取得する。"""

    @abstractmethod
    def save(self, order: Order) -> Order:
        """注文を永続化する。id が None なら新規作成、それ以外は更新。"""

    @abstractmethod
    def next_order_number(self) -> str:
        """新しい注文番号を採番する。形式: ORD-YYYYMMDD-XXXXXX。"""
