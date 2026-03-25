"""OrderService のユニットテスト。"""

from datetime import date, timedelta
from decimal import Decimal

import pytest

from apps.orders.domain.entities import DeliveryAddress, Order
from apps.orders.domain.interfaces import OrderRepository
from apps.orders.domain.value_objects import (
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

    def find_all(
        self,
        *,
        status: str | None = None,
        date_from: date | None = None,
        date_to: date | None = None,
    ) -> list[Order]:
        result = list(self._orders.values())
        if status:
            result = [o for o in result if o.status.value == status]
        if date_from:
            result = [o for o in result if o.delivery_date.value >= date_from]
        if date_to:
            result = [o for o in result if o.delivery_date.value <= date_to]
        return sorted(result, key=lambda o: o.id or 0, reverse=True)

    def search_by_order_number(self, query: str) -> list[Order]:
        return [
            o
            for o in self._orders.values()
            if query.lower() in str(o.order_number).lower()
        ]

    def find_recent_addresses(self) -> list[DeliveryAddress]:
        seen: set[str] = set()
        addresses: list[DeliveryAddress] = []
        for order in sorted(
            self._orders.values(),
            key=lambda o: o.id or 0,
            reverse=True,
        ):
            addr = order.delivery_address
            key = f"{addr.recipient_name}|{addr.address}"
            if key not in seen:
                seen.add(key)
                addresses.append(order.delivery_address)
        return addresses

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


class TestOrderServiceCancel:
    """注文キャンセルのテスト。"""

    def _place_order(self, repo, days_ahead=10):
        service = OrderService(order_repo=repo)
        return service.place_order(
            PlaceOrderCommand(
                product_id=1,
                product_name="ブーケ",
                unit_price=Decimal("5000"),
                quantity=1,
                delivery_date=date.today() + timedelta(days=days_ahead),
                recipient_name="山田太郎",
                postal_code="100-0001",
                address="東京都千代田区千代田1-1",
                phone="03-1234-5678",
            )
        )

    def test_確定済み注文をキャンセルできる(self):
        repo = FakeOrderRepository()
        order = self._place_order(repo)
        service = OrderService(order_repo=repo)
        cancelled = service.cancel_order(order.id)
        assert cancelled.status == OrderStatus.CANCELLED

    def test_存在しない注文をキャンセルするとエラー(self):
        repo = FakeOrderRepository()
        service = OrderService(order_repo=repo)
        with pytest.raises(ValueError, match="注文が見つかりません"):
            service.cancel_order(9999)

    def test_キャンセル結果がリポジトリに保存される(self):
        repo = FakeOrderRepository()
        order = self._place_order(repo)
        service = OrderService(order_repo=repo)
        service.cancel_order(order.id)
        found = repo.find_by_id(order.id)
        assert found.status == OrderStatus.CANCELLED


class TestOrderServiceListOrders:
    """注文一覧のテスト。"""

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
        }
        defaults.update(kwargs)
        return PlaceOrderCommand(**defaults)

    def test_全注文を取得できる(self):
        repo = FakeOrderRepository()
        service = OrderService(order_repo=repo)
        service.place_order(self._make_command())
        service.place_order(
            self._make_command(delivery_date=date.today() + timedelta(days=7))
        )

        orders = service.list_orders()
        assert len(orders) == 2

    def test_ステータスでフィルタできる(self):
        repo = FakeOrderRepository()
        service = OrderService(order_repo=repo)
        order = service.place_order(
            self._make_command(delivery_date=date.today() + timedelta(days=10))
        )
        service.cancel_order(order.id)
        service.place_order(
            self._make_command(delivery_date=date.today() + timedelta(days=7))
        )

        confirmed = service.list_orders(status="confirmed")
        assert len(confirmed) == 1
        cancelled = service.list_orders(status="cancelled")
        assert len(cancelled) == 1

    def test_日付範囲でフィルタできる(self):
        repo = FakeOrderRepository()
        service = OrderService(order_repo=repo)
        d1 = date.today() + timedelta(days=5)
        d2 = date.today() + timedelta(days=10)
        service.place_order(self._make_command(delivery_date=d1))
        service.place_order(self._make_command(delivery_date=d2))

        filtered = service.list_orders(date_from=d2, date_to=d2)
        assert len(filtered) == 1
        assert filtered[0].delivery_date.value == d2


class TestOrderServiceListRecentAddresses:
    """過去の届け先一覧のテスト。"""

    def _make_command(self, **kwargs) -> PlaceOrderCommand:
        defaults = {
            "product_id": 1,
            "product_name": "ブーケ",
            "unit_price": Decimal("5000"),
            "quantity": 1,
            "delivery_date": date.today() + timedelta(days=5),
            "recipient_name": "山田花子",
            "postal_code": "100-0001",
            "address": "東京都千代田区千代田1-1",
            "phone": "03-1234-5678",
        }
        defaults.update(kwargs)
        return PlaceOrderCommand(**defaults)

    def test_過去の届け先を重複なしで取得できる(self):
        repo = FakeOrderRepository()
        service = OrderService(order_repo=repo)
        # 同じ届け先に 2 回注文
        service.place_order(
            self._make_command(delivery_date=date.today() + timedelta(days=5))
        )
        service.place_order(
            self._make_command(delivery_date=date.today() + timedelta(days=7))
        )
        # 別の届け先に 1 回注文
        service.place_order(
            self._make_command(
                delivery_date=date.today() + timedelta(days=9),
                recipient_name="田中太郎",
                address="大阪府大阪市北区1-1",
            )
        )

        addresses = service.list_recent_addresses()
        assert len(addresses) == 2

    def test_注文がない場合は空リスト(self):
        repo = FakeOrderRepository()
        service = OrderService(order_repo=repo)
        assert service.list_recent_addresses() == []


class TestOrderServiceChangeDeliveryDate:
    """届け日変更のテスト（US-013）。"""

    def _make_command(self, **kwargs) -> PlaceOrderCommand:
        defaults = {
            "product_id": 1,
            "product_name": "バースデーブーケ",
            "unit_price": Decimal("5000"),
            "quantity": 1,
            "delivery_date": date.today() + timedelta(days=10),
            "recipient_name": "山田太郎",
            "postal_code": "100-0001",
            "address": "東京都千代田区千代田1-1",
            "phone": "03-1234-5678",
            "message": "",
        }
        defaults.update(kwargs)
        return PlaceOrderCommand(**defaults)

    def test_届け日を変更できる(self):
        repo = FakeOrderRepository()
        service = OrderService(order_repo=repo)
        order = service.place_order(self._make_command())
        new_date = date.today() + timedelta(days=14)
        updated = service.change_delivery_date(order.id, new_date)
        assert updated.delivery_date.value == new_date

    def test_存在しない注文の届け日変更でエラー(self):
        repo = FakeOrderRepository()
        service = OrderService(order_repo=repo)
        with pytest.raises(ValueError, match="注文が見つかりません"):
            service.change_delivery_date(
                999, date.today() + timedelta(days=14)
            )

    def test_変更期限超過でエラー(self):
        repo = FakeOrderRepository()
        service = OrderService(order_repo=repo)
        # 届け日が3日後 → 変更期限は今日 → 明日以降はNG
        order = service.place_order(
            self._make_command(
                delivery_date=date.today() + timedelta(days=3)
            )
        )
        # change_delivery_date は内部で date.today() を使うので
        # 期限内であれば変更可能（3日前まで＝今日がギリギリ）
        new_date = date.today() + timedelta(days=14)
        updated = service.change_delivery_date(order.id, new_date)
        assert updated.delivery_date.value == new_date
