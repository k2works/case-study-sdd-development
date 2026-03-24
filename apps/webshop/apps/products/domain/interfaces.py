"""商品ドメインの Repository インターフェース定義。

ProductRepository, ItemRepository を ABC として定義する。
ドメイン層はこのインターフェースに依存し、
インフラ層（repositories.py）が具体的な実装を提供する。
"""

from __future__ import annotations

from abc import ABC, abstractmethod

from apps.products.domain.entities import Item, Product, Supplier


class ItemRepository(ABC):
    """単品リポジトリインターフェース。"""

    @abstractmethod
    def find_by_id(self, item_id: int) -> Item | None:
        """ID で単品を取得する。"""

    @abstractmethod
    def find_active(self) -> list[Item]:
        """有効な単品一覧を取得する。"""

    @abstractmethod
    def save(self, item: Item) -> Item:
        """単品を保存する。"""


class SupplierRepository(ABC):
    """仕入先リポジトリインターフェース。"""

    @abstractmethod
    def find_by_id(self, supplier_id: int) -> Supplier | None:
        """ID で仕入先を取得する。"""

    @abstractmethod
    def save(self, supplier: Supplier) -> Supplier:
        """仕入先を保存する。"""


class ProductRepository(ABC):
    """商品リポジトリインターフェース。"""

    @abstractmethod
    def find_by_id(self, product_id: int) -> Product | None:
        """ID で商品を取得する。"""

    @abstractmethod
    def find_active(self) -> list[Product]:
        """有効な商品一覧を取得する。"""

    @abstractmethod
    def save(self, product: Product) -> Product:
        """商品を保存する。"""
