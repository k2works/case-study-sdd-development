"""OrderService のユニットテスト。"""

from datetime import date, timedelta
from decimal import Decimal

import pytest

from apps.orders.domain.entities import DeliveryAddress, Order, OrderLine
from apps.orders.domain.interfaces import OrderRepository
from apps.orders.domain.value_objects import (
    DeliveryDate,
    Message,
    OrderNumber,
    OrderStatus,
)
from apps.orders.services import OrderService, PlaceOrderCommand


class FakeOrderRepository(OrderRepository):
    """テスト用のインメモリ Repository。"""

    def __init__(self):
        self._orders: dict[int, Order] = {}
        self._next_id = 1
        self._counter = 0

    def find_by_id(self, order_id: int) -> Order | None:
        return self._orders.get(order_id)

    def find_by_order_number(self, order_number: str) -> Order | None:
        for order in self._orders.values():
            if str(order.order_number) == order_number:
                return order
        return None

    def save(self, order: Order) -> Order:
        if order.id is None:
            order.id = self._next_id
            self._next_id += 1
        self._orders[order.id] = order
        return order

    def next_order_number(self) -> str:
        self._counter += 1
        return f"ORD-TEST-{self._counter:03d}"


class TestOrderServicePlaceOrder:
    """注文作成のテスト。"""

    def _make_command(self, **kwargs) -> PlaceOrderCommand:
        defaults = {
            "product_id": 1,
            "product_name": "バースデーブーケ",
            "unit_price": Decimal("5000"),
            "quantity": 1,
            "delivery_date": date.today() + timedelta(days=5),
            "recipient_name": "山田太郎",
            "postal_code": "100-0001",
            "address": "東京都千代田区千代田1-1",
            "phone": "03-1234-5678",
            "message": "お誕生日おめでとう",
        }
        defaults.update(kwargs)
        return PlaceOrderCommand(**defaults)

    def test_注文を作成し確定できる(self):
        repo = FakeOrderRepository()
        service = OrderService(order_repo=repo)
        order = service.place_order(self._make_command())

        assert order.id is not None
        assert order.status == OrderStatus.CONFIRMED
        assert str(order.order_number) == "ORD-TEST-001"

    def test_注文の合計金額が正しい(self):
        repo = FakeOrderRepository()
        service = OrderService(order_repo=repo)
        order = service.place_order(
            self._make_command(unit_price=Decimal("3000"), quantity=2)
        )

        assert order.total_amount == Decimal("6000")

    def test_注文がリポジトリに保存される(self):
        repo = FakeOrderRepository()
        service = OrderService(order_repo=repo)
        order = service.place_order(self._make_command())

        found = repo.find_by_id(order.id)
        assert found is not None
        assert str(found.order_number) == str(order.order_number)

    def test_届け日が過去だとエラー(self):
        repo = FakeOrderRepository()
        service = OrderService(order_repo=repo)
        with pytest.raises(ValueError):
            service.place_order(
                self._make_command(delivery_date=date.today() - timedelta(days=1))
            )


class TestOrderServiceFind:
    """注文検索のテスト。"""

    def test_IDで注文を取得できる(self):
        repo = FakeOrderRepository()
        service = OrderService(order_repo=repo)
        order = service.place_order(
            PlaceOrderCommand(
                product_id=1,
                product_name="ブーケ",
                unit_price=Decimal("5000"),
                quantity=1,
                delivery_date=date.today() + timedelta(days=5),
                recipient_name="山田太郎",
                postal_code="100-0001",
                address="東京都千代田区千代田1-1",
                phone="03-1234-5678",
            )
        )

        found = service.find_order(order.id)
        assert found is not None

    def test_存在しないIDでNone(self):
        repo = FakeOrderRepository()
        service = OrderService(order_repo=repo)
        assert service.find_order(9999) is None

    def test_注文番号で注文を取得できる(self):
        repo = FakeOrderRepository()
        service = OrderService(order_repo=repo)
        order = service.place_order(
            PlaceOrderCommand(
                product_id=1,
                product_name="ブーケ",
                unit_price=Decimal("5000"),
                quantity=1,
                delivery_date=date.today() + timedelta(days=5),
                recipient_name="山田太郎",
                postal_code="100-0001",
                address="東京都千代田区千代田1-1",
                phone="03-1234-5678",
            )
        )

        found = service.find_order_by_number(str(order.order_number))
        assert found is not None
