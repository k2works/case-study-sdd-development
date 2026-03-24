"""受注ドメインの Repository インターフェース。"""

from __future__ import annotations

from abc import ABC, abstractmethod

from apps.orders.domain.entities import Order


class OrderRepository(ABC):
    """注文 Repository の抽象インターフェース。"""

    @abstractmethod
    def find_by_id(self, order_id: int) -> Order | None: ...

    @abstractmethod
    def find_by_order_number(self, order_number: str) -> Order | None: ...

    @abstractmethod
    def save(self, order: Order) -> Order: ...

    @abstractmethod
    def next_order_number(self) -> str: ...
