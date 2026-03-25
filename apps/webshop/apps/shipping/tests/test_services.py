"""出荷管理アプリケーションサービスの統合テスト。"""

from datetime import date, timedelta
from decimal import Decimal

import pytest

from apps.orders.models import Order as OrderModel
from apps.orders.models import OrderLine as OrderLineModel
from apps.orders.repositories import DjangoOrderRepository
from apps.products.models import Composition, Item, Product, Supplier
from apps.shipping.repositories import DjangoShipmentRepository
from apps.shipping.services import ShippingService


@pytest.mark.django_db
class TestShippingServiceBundling:
    """結束対象取得のテスト（US-010）。"""

    def setup_method(self):
        self.supplier = Supplier.objects.create(name="テスト仕入先")
        self.item1 = Item.objects.create(
            name="バラ（赤）",
            quality_retention_days=7,
            purchase_unit=10,
            lead_time_days=2,
            supplier=self.supplier,
        )
        self.item2 = Item.objects.create(
            name="カスミソウ",
            quality_retention_days=5,
            purchase_unit=20,
            lead_time_days=1,
            supplier=self.supplier,
        )
        self.product = Product.objects.create(
            name="バースデーブーケ",
            price=Decimal("5000"),
        )
        Composition.objects.create(
            product=self.product, item=self.item1, quantity=5
        )
        Composition.objects.create(
            product=self.product, item=self.item2, quantity=3
        )
        self.service = ShippingService(
            order_repo=DjangoOrderRepository(),
            shipment_repo=DjangoShipmentRepository(),
        )

    def _create_order(self, delivery_date, status="confirmed"):
        order = OrderModel.objects.create(
            order_number=f"ORD-{OrderModel.objects.count() + 1:03d}",
            delivery_date=delivery_date,
            status=status,
            recipient_name="山田太郎",
            postal_code="100-0001",
            address="東京都千代田区",
            phone="03-1234-5678",
            message="テスト",
        )
        OrderLineModel.objects.create(
            order=order,
            product_id=self.product.pk,
            product_name=self.product.name,
            unit_price=self.product.price,
            quantity=1,
        )
        return order

    def test_結束対象を取得できる(self):
        # 出荷日=今日 → 届け日=明日
        tomorrow = date.today() + timedelta(days=1)
        self._create_order(delivery_date=tomorrow)

        summary = self.service.get_bundling_summary(
            shipping_date=date.today()
        )
        assert len(summary.targets) == 1
        assert summary.item_totals["バラ（赤）"] == 5
        assert summary.item_totals["カスミソウ"] == 3

    def test_複数注文の花材が集計される(self):
        tomorrow = date.today() + timedelta(days=1)
        self._create_order(delivery_date=tomorrow)
        self._create_order(delivery_date=tomorrow)

        summary = self.service.get_bundling_summary(
            shipping_date=date.today()
        )
        assert len(summary.targets) == 2
        assert summary.item_totals["バラ（赤）"] == 10
        assert summary.item_totals["カスミソウ"] == 6

    def test_異なる届け日の注文は含まれない(self):
        tomorrow = date.today() + timedelta(days=1)
        day_after = date.today() + timedelta(days=2)
        self._create_order(delivery_date=tomorrow)
        self._create_order(delivery_date=day_after)

        summary = self.service.get_bundling_summary(
            shipping_date=date.today()
        )
        assert len(summary.targets) == 1

    def test_キャンセル済み注文は含まれない(self):
        tomorrow = date.today() + timedelta(days=1)
        self._create_order(delivery_date=tomorrow, status="cancelled")

        summary = self.service.get_bundling_summary(
            shipping_date=date.today()
        )
        assert len(summary.targets) == 0

    def test_結束対象なしの場合(self):
        summary = self.service.get_bundling_summary(
            shipping_date=date.today()
        )
        assert len(summary.targets) == 0
        assert len(summary.item_totals) == 0


@pytest.mark.django_db
class TestShippingServiceShipOrder:
    """出荷処理のテスト（US-011）。"""

    def setup_method(self):
        self.supplier = Supplier.objects.create(name="テスト仕入先")
        self.product = Product.objects.create(
            name="バースデーブーケ",
            price=Decimal("5000"),
        )
        self.service = ShippingService(
            order_repo=DjangoOrderRepository(),
            shipment_repo=DjangoShipmentRepository(),
        )

    def _create_confirmed_order(self):
        order = OrderModel.objects.create(
            order_number="ORD-SHIP-001",
            delivery_date=date.today() + timedelta(days=1),
            status="confirmed",
            recipient_name="山田太郎",
            postal_code="100-0001",
            address="東京都千代田区",
            phone="03-1234-5678",
            message="テスト",
        )
        OrderLineModel.objects.create(
            order=order,
            product_id=self.product.pk,
            product_name=self.product.name,
            unit_price=self.product.price,
            quantity=1,
        )
        return order

    def test_出荷処理ができる(self):
        order = self._create_confirmed_order()
        shipment = self.service.ship_order(order.pk)

        assert shipment.id is not None
        assert shipment.order_id == order.pk
        assert shipment.shipped_at is not None
        assert shipment.notified_at is not None

        # 注文ステータスが出荷済みになっている
        order.refresh_from_db()
        assert order.status == "shipped"

    def test_存在しない注文の出荷でエラー(self):
        with pytest.raises(ValueError, match="注文が見つかりません"):
            self.service.ship_order(999)

    def test_出荷済み注文を再出荷するとエラー(self):
        order = self._create_confirmed_order()
        self.service.ship_order(order.pk)
        with pytest.raises(ValueError):
            self.service.ship_order(order.pk)

    def test_キャンセル済み注文を出荷するとエラー(self):
        order = OrderModel.objects.create(
            order_number="ORD-SHIP-CAN",
            delivery_date=date.today() + timedelta(days=1),
            status="cancelled",
            recipient_name="山田太郎",
            postal_code="100-0001",
            address="東京都千代田区",
            phone="03-1234-5678",
            message="テスト",
        )
        OrderLineModel.objects.create(
            order=order,
            product_id=self.product.pk,
            product_name=self.product.name,
            unit_price=self.product.price,
            quantity=1,
        )
        with pytest.raises(ValueError):
            self.service.ship_order(order.pk)

    def test_保留中注文を出荷するとエラー(self):
        order = OrderModel.objects.create(
            order_number="ORD-SHIP-PEN",
            delivery_date=date.today() + timedelta(days=1),
            status="pending",
            recipient_name="山田太郎",
            postal_code="100-0001",
            address="東京都千代田区",
            phone="03-1234-5678",
            message="テスト",
        )
        OrderLineModel.objects.create(
            order=order,
            product_id=self.product.pk,
            product_name=self.product.name,
            unit_price=self.product.price,
            quantity=1,
        )
        with pytest.raises(ValueError):
            self.service.ship_order(order.pk)

    def test_出荷対象一覧を取得できる(self):
        self._create_confirmed_order()
        orders = self.service.list_shippable_orders(
            shipping_date=date.today()
        )
        assert len(orders) == 1
