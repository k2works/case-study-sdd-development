"""出荷管理 View の統合テスト。"""

from datetime import date, timedelta
from decimal import Decimal

import pytest
from django.test import Client

from apps.orders.models import Order as OrderModel
from apps.orders.models import OrderLine as OrderLineModel
from apps.products.models import Composition, Item, Product, Supplier
from apps.shipping.models import Shipment as ShipmentModel


@pytest.mark.django_db
class TestBundlingListView:
    """結束一覧画面のテスト（US-010）。"""

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
        self.product = Product.objects.create(
            name="バースデーブーケ",
            price=Decimal("5000"),
        )
        Composition.objects.create(product=self.product, item=self.item, quantity=5)

    def test_結束一覧画面を表示できる(self):
        response = self.client.get("/staff/shipping/bundling/")
        assert response.status_code == 200
        assert "結束対象" in response.content.decode()

    def test_結束対象がない場合のメッセージ(self):
        response = self.client.get("/staff/shipping/bundling/")
        content = response.content.decode()
        assert "本日の結束対象はありません" in content

    def test_結束対象が表示される(self):
        tomorrow = date.today() + timedelta(days=1)
        order = OrderModel.objects.create(
            order_number="ORD-B-001",
            delivery_date=tomorrow,
            status="confirmed",
            recipient_name="山田太郎",
            postal_code="100-0001",
            address="東京都千代田区",
            phone="03-1234-5678",
        )
        OrderLineModel.objects.create(
            order=order,
            product_id=self.product.pk,
            product_name=self.product.name,
            unit_price=self.product.price,
            quantity=1,
        )
        response = self.client.get("/staff/shipping/bundling/")
        content = response.content.decode()
        assert "バラ（赤）" in content
        assert "山田太郎" in content


@pytest.mark.django_db
class TestShipmentListView:
    """出荷管理画面のテスト（US-011）。"""

    def setup_method(self):
        self.client = Client()
        self.supplier = Supplier.objects.create(name="テスト仕入先")
        self.product = Product.objects.create(
            name="バースデーブーケ",
            price=Decimal("5000"),
        )

    def _create_confirmed_order(self):
        order = OrderModel.objects.create(
            order_number="ORD-S-001",
            delivery_date=date.today() + timedelta(days=1),
            status="confirmed",
            recipient_name="山田太郎",
            postal_code="100-0001",
            address="東京都千代田区",
            phone="03-1234-5678",
        )
        OrderLineModel.objects.create(
            order=order,
            product_id=self.product.pk,
            product_name=self.product.name,
            unit_price=self.product.price,
            quantity=1,
        )
        return order

    def test_出荷管理画面を表示できる(self):
        response = self.client.get("/staff/shipping/shipments/")
        assert response.status_code == 200
        assert "出荷管理" in response.content.decode()

    def test_出荷対象がない場合のメッセージ(self):
        response = self.client.get("/staff/shipping/shipments/")
        content = response.content.decode()
        assert "本日の出荷対象はありません" in content

    def test_出荷処理ができる(self):
        order = self._create_confirmed_order()
        response = self.client.post(
            "/staff/shipping/shipments/",
            {"order_id": str(order.pk)},
        )
        assert response.status_code == 302
        # 出荷レコードが作成されている
        assert ShipmentModel.objects.count() == 1
        # 注文ステータスが出荷済み
        order.refresh_from_db()
        assert order.status == "shipped"
