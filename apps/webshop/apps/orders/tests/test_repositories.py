"""受注 Repository の統合テスト。"""

from datetime import date, timedelta
from decimal import Decimal

import pytest

from apps.orders.domain.entities import DeliveryAddress, Order, OrderLine
from apps.orders.domain.value_objects import (
    DeliveryDate,
    Message,
    OrderNumber,
    OrderStatus,
)
from apps.orders.repositories import DjangoOrderRepository
from apps.products.models import Product


@pytest.mark.django_db
class TestDjangoOrderRepository:
    """注文 Repository の統合テスト。"""

    def setup_method(self):
        self.repo = DjangoOrderRepository()
        self.product = Product.objects.create(
            name="バースデーブーケ",
            description="お誕生日用",
            price="5000.00",
        )

    def _make_order(self, **kwargs):
        defaults = {
            "id": None,
            "order_number": OrderNumber("ORD-TEST-001"),
            "delivery_date": DeliveryDate(date.today() + timedelta(days=3)),
            "delivery_address": DeliveryAddress(
                recipient_name="山田太郎",
                postal_code="100-0001",
                address="東京都千代田区千代田1-1",
                phone="03-1234-5678",
            ),
            "message": Message("お誕生日おめでとう"),
            "lines": [
                OrderLine(
                    product_id=self.product.pk,
                    product_name="バースデーブーケ",
                    unit_price=Decimal("5000"),
                    quantity=1,
                ),
            ],
        }
        defaults.update(kwargs)
        return Order(**defaults)

    def test_注文を保存して取得できる(self):
        order = self._make_order()
        saved = self.repo.save(order)
        assert saved.id is not None
        found = self.repo.find_by_id(saved.id)
        assert found is not None
        assert found.order_number == OrderNumber("ORD-TEST-001")

    def test_注文番号で検索できる(self):
        order = self._make_order()
        self.repo.save(order)
        found = self.repo.find_by_order_number("ORD-TEST-001")
        assert found is not None
        assert found.delivery_address.recipient_name == "山田太郎"

    def test_存在しない注文でNone(self):
        assert self.repo.find_by_id(9999) is None
        assert self.repo.find_by_order_number("NONE") is None

    def test_明細が永続化される(self):
        order = self._make_order()
        saved = self.repo.save(order)
        found = self.repo.find_by_id(saved.id)
        assert len(found.lines) == 1
        assert found.lines[0].product_name == "バースデーブーケ"
        assert found.lines[0].unit_price == Decimal("5000")

    def test_注文番号を生成できる(self):
        num = self.repo.next_order_number()
        assert num.startswith("ORD-")
        assert len(num) > 10

    def test_ステータス更新が永続化される(self):
        order = self._make_order()
        saved = self.repo.save(order)
        saved.confirm()
        self.repo.save(saved)
        found = self.repo.find_by_id(saved.id)
        assert found.status == OrderStatus.CONFIRMED
