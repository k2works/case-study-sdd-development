"""仕入管理 View の統合テスト。"""

from datetime import date, timedelta

import pytest
from django.test import Client

from apps.inventory.models import StockLot as StockLotModel
from apps.products.models import Item, Supplier
from apps.purchasing.models import PurchaseOrder as PurchaseOrderModel


@pytest.mark.django_db
class TestPurchaseOrderListView:
    """発注一覧画面のテスト。"""

    def setup_method(self):
        self.client = Client()
        self.supplier = Supplier.objects.create(name="テスト仕入先")
        self.item = Item.objects.create(
            name="バラ（赤）",
            quality_retention_days=7,
            purchase_unit=10,
            lead_time_days=2,
            supplier=self.supplier,
        )

    def test_発注一覧画面を表示できる(self):
        response = self.client.get("/staff/purchasing/orders/")
        assert response.status_code == 200
        assert "発注一覧" in response.content.decode()

    def test_発注済みの一覧が表示される(self):
        PurchaseOrderModel.objects.create(
            item=self.item,
            supplier=self.supplier,
            quantity=100,
            expected_arrival_date=date.today() + timedelta(days=3),
            status="ordered",
        )
        response = self.client.get("/staff/purchasing/orders/")
        content = response.content.decode()
        assert "バラ（赤）" in content
        assert "テスト仕入先" in content


@pytest.mark.django_db
class TestPurchaseOrderCreateView:
    """発注登録画面のテスト。"""

    def setup_method(self):
        self.client = Client()
        self.supplier = Supplier.objects.create(name="テスト仕入先")
        self.item = Item.objects.create(
            name="バラ（赤）",
            quality_retention_days=7,
            purchase_unit=10,
            lead_time_days=2,
            supplier=self.supplier,
        )

    def test_発注登録画面を表示できる(self):
        response = self.client.get("/staff/purchasing/orders/new/")
        assert response.status_code == 200
        assert "発注登録" in response.content.decode()

    def test_単品選択時に仕入先が表示される(self):
        response = self.client.get(
            f"/staff/purchasing/orders/new/?item_id={self.item.pk}"
        )
        content = response.content.decode()
        assert "テスト仕入先" in content

    def test_発注を登録できる(self):
        response = self.client.post(
            "/staff/purchasing/orders/new/",
            {
                "item_id": self.item.pk,
                "quantity": "100",
                "expected_arrival_date": str(date.today() + timedelta(days=3)),
            },
        )
        assert response.status_code == 302
        assert PurchaseOrderModel.objects.count() == 1
        po = PurchaseOrderModel.objects.first()
        assert po.item == self.item
        assert po.supplier == self.supplier
        assert po.quantity == 100


@pytest.mark.django_db
class TestArrivalCreateView:
    """入荷登録画面のテスト。"""

    def setup_method(self):
        self.client = Client()
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

    def test_入荷登録画面を表示できる(self):
        response = self.client.get("/staff/purchasing/arrivals/new/")
        assert response.status_code == 200
        assert "入荷登録" in response.content.decode()

    def test_発注選択時に詳細が表示される(self):
        response = self.client.get(
            f"/staff/purchasing/arrivals/new/?po_id={self.po.pk}"
        )
        content = response.content.decode()
        assert "発注数量" in content

    def test_入荷を登録できる(self):
        response = self.client.post(
            "/staff/purchasing/arrivals/new/",
            {
                "purchase_order_id": str(self.po.pk),
                "quantity": "100",
                "arrived_at": str(date.today()),
            },
        )
        assert response.status_code == 302
        # 在庫ロットが作成される
        assert StockLotModel.objects.count() == 1
        lot = StockLotModel.objects.first()
        assert lot.quantity == 100
        assert lot.item == self.item
        # 発注ステータスが入荷済みになる
        self.po.refresh_from_db()
        assert self.po.status == "arrived"


@pytest.mark.django_db
class TestExpiryAlertView:
    """品質維持期限アラート画面のテスト。"""

    def setup_method(self):
        self.client = Client()
        self.supplier = Supplier.objects.create(name="テスト仕入先")
        self.item = Item.objects.create(
            name="バラ（赤）",
            quality_retention_days=7,
            purchase_unit=10,
            lead_time_days=2,
            supplier=self.supplier,
        )

    def test_アラート画面を表示できる(self):
        response = self.client.get("/staff/purchasing/alerts/expiry/")
        assert response.status_code == 200
        assert "品質維持期限アラート" in response.content.decode()

    def test_期限間近の在庫がない場合のメッセージ(self):
        response = self.client.get("/staff/purchasing/alerts/expiry/")
        content = response.content.decode()
        assert "期限が近い在庫はありません" in content

    def test_期限間近の在庫ロットが表示される(self):
        # 残り 1 日のロットを作成
        StockLotModel.objects.create(
            item=self.item,
            quantity=50,
            remaining_quantity=30,
            arrived_at=date.today() - timedelta(days=5),
            expiry_date=date.today() + timedelta(days=1),
            status="available",
        )
        response = self.client.get("/staff/purchasing/alerts/expiry/")
        content = response.content.decode()
        assert "バラ（赤）" in content
        assert "30" in content

    def test_当日期限の在庫ロットはアクティブでないため表示されない(self):
        # 残り 0 日（当日期限）→ find_active_by_item_id で除外される
        StockLotModel.objects.create(
            item=self.item,
            quantity=50,
            remaining_quantity=20,
            arrived_at=date.today() - timedelta(days=7),
            expiry_date=date.today(),
            status="available",
        )
        response = self.client.get("/staff/purchasing/alerts/expiry/")
        content = response.content.decode()
        assert "期限が近い在庫はありません" in content

    def test_残り2日の在庫ロットが表示される(self):
        # 閾値ちょうど（残り 2 日）
        StockLotModel.objects.create(
            item=self.item,
            quantity=50,
            remaining_quantity=30,
            arrived_at=date.today() - timedelta(days=5),
            expiry_date=date.today() + timedelta(days=2),
            status="available",
        )
        response = self.client.get("/staff/purchasing/alerts/expiry/")
        content = response.content.decode()
        assert "バラ（赤）" in content

    def test_残り3日の在庫ロットは表示されない(self):
        # 閾値+1（残り 3 日）
        StockLotModel.objects.create(
            item=self.item,
            quantity=50,
            remaining_quantity=30,
            arrived_at=date.today() - timedelta(days=4),
            expiry_date=date.today() + timedelta(days=3),
            status="available",
        )
        response = self.client.get("/staff/purchasing/alerts/expiry/")
        content = response.content.decode()
        assert "期限が近い在庫はありません" in content

    def test_期限が5日以上先の在庫ロットは表示されない(self):
        # 残り 5 日のロットを作成
        StockLotModel.objects.create(
            item=self.item,
            quantity=50,
            remaining_quantity=30,
            arrived_at=date.today() - timedelta(days=1),
            expiry_date=date.today() + timedelta(days=5),
            status="available",
        )
        response = self.client.get("/staff/purchasing/alerts/expiry/")
        content = response.content.decode()
        assert "期限が近い在庫はありません" in content
