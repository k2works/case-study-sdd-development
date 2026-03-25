"""仕入管理 Repository の統合テスト。"""

from datetime import date, timedelta

import pytest

from apps.products.models import Item, Supplier
from apps.purchasing.domain.entities import PurchaseOrder
from apps.purchasing.domain.value_objects import PurchaseOrderStatus
from apps.purchasing.models import PurchaseOrder as PurchaseOrderModel
from apps.purchasing.repositories import (
    DjangoArrivalRepository,
    DjangoPurchaseOrderRepository,
)


@pytest.mark.django_db
class TestDjangoPurchaseOrderRepository:
    """発注 Repository の統合テスト。"""

    def setup_method(self):
        self.repo = DjangoPurchaseOrderRepository()
        self.supplier = Supplier.objects.create(name="テスト仕入先")
        self.item = Item.objects.create(
            name="バラ（赤）",
            quality_retention_days=7,
            purchase_unit=10,
            lead_time_days=2,
            supplier=self.supplier,
        )

    def _create_po_model(self, **kwargs):
        defaults = {
            "item": self.item,
            "supplier": self.supplier,
            "quantity": 100,
            "expected_arrival_date": date.today() + timedelta(days=3),
            "status": "ordered",
        }
        defaults.update(kwargs)
        return PurchaseOrderModel.objects.create(**defaults)

    def test_発注を保存して取得できる(self):
        po_model = self._create_po_model()
        found = self.repo.find_by_id(po_model.pk)
        assert found is not None
        assert found.item_id == self.item.pk
        assert found.quantity == 100

    def test_存在しないIDでNoneを返す(self):
        assert self.repo.find_by_id(999) is None

    def test_ステータスで検索できる(self):
        self._create_po_model(status="ordered")
        self._create_po_model(status="arrived")
        results = self.repo.find_by_status("ordered")
        assert len(results) == 1
        assert results[0].status == PurchaseOrderStatus.ORDERED

    def test_発注済みの発注を取得できる(self):
        self._create_po_model(status="ordered")
        self._create_po_model(status="arrived")
        results = self.repo.find_ordered()
        assert len(results) == 1

    def test_単品IDで発注済みの発注を検索できる(self):
        self._create_po_model()
        item2 = Item.objects.create(
            name="カスミソウ",
            quality_retention_days=5,
            purchase_unit=20,
            lead_time_days=1,
            supplier=self.supplier,
        )
        self._create_po_model(item=item2)
        results = self.repo.find_ordered_by_item_id(self.item.pk)
        assert len(results) == 1
        assert results[0].item_id == self.item.pk

    def test_新規発注を保存できる(self):
        po = PurchaseOrder(
            id=None,
            item_id=self.item.pk,
            supplier_id=self.supplier.pk,
            quantity=50,
            expected_arrival_date=date.today() + timedelta(days=5),
            status=PurchaseOrderStatus.ORDERED,
            ordered_at=None,
        )
        saved = self.repo.save(po)
        assert saved.id is not None
        assert saved.quantity == 50

    def test_発注を更新できる(self):
        po_model = self._create_po_model()
        po = self.repo.find_by_id(po_model.pk)
        po.receive()
        saved = self.repo.save(po)
        assert saved.status == PurchaseOrderStatus.ARRIVED


@pytest.mark.django_db
class TestDjangoArrivalRepository:
    """入荷 Repository の統合テスト。"""

    def setup_method(self):
        self.repo = DjangoArrivalRepository()
        self.supplier = Supplier.objects.create(name="テスト仕入先")
        self.item = Item.objects.create(
            name="バラ（赤）",
            quality_retention_days=7,
            purchase_unit=10,
            lead_time_days=2,
            supplier=self.supplier,
        )
        self.po = PurchaseOrderModel.objects.create(
            item=self.item,
            supplier=self.supplier,
            quantity=100,
            expected_arrival_date=date.today() + timedelta(days=3),
            status="ordered",
        )

    def test_入荷を保存して取得できる(self):
        from apps.purchasing.domain.entities import Arrival

        arrival = Arrival(
            id=None,
            purchase_order_id=self.po.pk,
            item_id=self.item.pk,
            quantity=100,
            arrived_at=date.today(),
        )
        saved = self.repo.save(arrival)
        assert saved.id is not None

        found = self.repo.find_by_id(saved.id)
        assert found is not None
        assert found.quantity == 100

    def test_発注IDで入荷を検索できる(self):
        from apps.purchasing.domain.entities import Arrival

        arrival = Arrival(
            id=None,
            purchase_order_id=self.po.pk,
            item_id=self.item.pk,
            quantity=100,
            arrived_at=date.today(),
        )
        self.repo.save(arrival)

        results = self.repo.find_by_purchase_order_id(self.po.pk)
        assert len(results) == 1
        assert results[0].purchase_order_id == self.po.pk

    def test_存在しないIDでNoneを返す(self):
        assert self.repo.find_by_id(999) is None
