"""商品管理の Repository 統合テスト。

Django ORM を使用した CRUD 操作をテストする。
"""

import pytest

from apps.products.domain.entities import Item, Supplier
from apps.products.domain.value_objects import (
    ItemName,
    LeadTimeDays,
    PurchaseUnit,
    QualityRetentionDays,
)
from apps.products.repositories import DjangoItemRepository, DjangoSupplierRepository


@pytest.mark.django_db
class TestDjangoSupplierRepository:
    """仕入先 Repository の統合テスト。"""

    def setup_method(self):
        self.repo = DjangoSupplierRepository()

    def test_仕入先を保存して取得できる(self):
        supplier = Supplier(id=0, name="花卉市場A", contact_info="03-1234-5678")
        saved = self.repo.save(supplier)

        assert saved.id > 0
        assert saved.name == "花卉市場A"

        found = self.repo.find_by_id(saved.id)
        assert found is not None
        assert found.name == "花卉市場A"
        assert found.contact_info == "03-1234-5678"

    def test_存在しないIDで取得するとNone(self):
        assert self.repo.find_by_id(9999) is None

    def test_仕入先を更新できる(self):
        supplier = Supplier(id=0, name="花卉市場A", contact_info="03-1234-5678")
        saved = self.repo.save(supplier)

        saved.name = "花卉市場B"
        updated = self.repo.save(saved)

        found = self.repo.find_by_id(updated.id)
        assert found is not None
        assert found.name == "花卉市場B"


@pytest.mark.django_db
class TestDjangoItemRepository:
    """単品 Repository の統合テスト。"""

    def setup_method(self):
        self.item_repo = DjangoItemRepository()
        self.supplier_repo = DjangoSupplierRepository()
        supplier = Supplier(id=0, name="花卉市場A")
        self.supplier = self.supplier_repo.save(supplier)

    def test_単品を保存して取得できる(self):
        item = Item(
            id=0,
            name=ItemName("バラ（赤）"),
            quality_retention_days=QualityRetentionDays(7),
            purchase_unit=PurchaseUnit(10),
            lead_time_days=LeadTimeDays(3),
            supplier_id=self.supplier.id,
        )
        saved = self.item_repo.save(item)

        assert saved.id > 0
        found = self.item_repo.find_by_id(saved.id)
        assert found is not None
        assert found.name == ItemName("バラ（赤）")
        assert found.quality_retention_days == QualityRetentionDays(7)
        assert found.supplier_id == self.supplier.id

    def test_有効な単品一覧を取得できる(self):
        item1 = Item(
            id=0,
            name=ItemName("バラ（赤）"),
            quality_retention_days=QualityRetentionDays(7),
            purchase_unit=PurchaseUnit(10),
            lead_time_days=LeadTimeDays(3),
            supplier_id=self.supplier.id,
        )
        item2 = Item(
            id=0,
            name=ItemName("カスミソウ"),
            quality_retention_days=QualityRetentionDays(5),
            purchase_unit=PurchaseUnit(20),
            lead_time_days=LeadTimeDays(2),
            supplier_id=self.supplier.id,
            is_active=False,
        )
        self.item_repo.save(item1)
        self.item_repo.save(item2)

        active_items = self.item_repo.find_active()
        assert len(active_items) == 1
        assert active_items[0].name == ItemName("バラ（赤）")

    def test_存在しないIDで取得するとNone(self):
        assert self.item_repo.find_by_id(9999) is None
