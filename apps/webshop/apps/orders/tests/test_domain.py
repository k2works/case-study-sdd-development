"""受注ドメイン層のユニットテスト。

Order 集約・値オブジェクトのビジネスルールを DB 非依存でテストする。
"""

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

# --- OrderNumber ---


class TestOrderNumber:
    """注文番号の値オブジェクトテスト。"""

    def test_正常な番号で生成できる(self):
        num = OrderNumber("ORD-20260324-001")
        assert num.value == "ORD-20260324-001"

    def test_空文字で生成するとエラー(self):
        with pytest.raises(ValueError):
            OrderNumber("")

    def test_等価性(self):
        assert OrderNumber("ORD-001") == OrderNumber("ORD-001")


# --- OrderStatus ---


class TestOrderStatus:
    """注文ステータスのテスト。"""

    def test_初期状態はPENDING(self):
        assert OrderStatus.PENDING.value == "pending"

    def test_確定状態はCONFIRMED(self):
        assert OrderStatus.CONFIRMED.value == "confirmed"


# --- DeliveryDate ---


class TestDeliveryDate:
    """届け日の値オブジェクトテスト。"""

    def test_未来の日付で生成できる(self):
        future = date.today() + timedelta(days=3)
        dd = DeliveryDate(future)
        assert dd.value == future

    def test_過去の日付で生成するとエラー(self):
        past = date.today() - timedelta(days=1)
        with pytest.raises(ValueError):
            DeliveryDate(past)

    def test_当日はエラー(self):
        with pytest.raises(ValueError):
            DeliveryDate(date.today())

    def test_等価性(self):
        d = date.today() + timedelta(days=5)
        assert DeliveryDate(d) == DeliveryDate(d)

    def test_reconstructで過去日付を復元できる(self):
        past = date.today() - timedelta(days=30)
        dd = DeliveryDate.reconstruct(past)
        assert dd.value == past

    def test_reconstructと通常生成の等価性(self):
        d = date.today() + timedelta(days=5)
        assert DeliveryDate(d) == DeliveryDate.reconstruct(d)

    def test_翌日で生成できる(self):
        tomorrow = date.today() + timedelta(days=1)
        dd = DeliveryDate(tomorrow)
        assert dd.value == tomorrow

    def test_変更期限は届け日の3日前(self):
        d = date.today() + timedelta(days=10)
        dd = DeliveryDate(d)
        assert dd.change_deadline() == d - timedelta(days=3)


# --- Message ---


class TestMessage:
    """メッセージカードの値オブジェクトテスト。"""

    def test_正常なメッセージで生成できる(self):
        msg = Message("お誕生日おめでとうございます")
        assert msg.value == "お誕生日おめでとうございます"

    def test_空メッセージで生成できる(self):
        msg = Message("")
        assert msg.value == ""

    def test_200文字で生成できる(self):
        msg = Message("あ" * 200)
        assert len(msg.value) == 200

    def test_201文字で生成するとエラー(self):
        with pytest.raises(ValueError):
            Message("あ" * 201)


# --- DeliveryAddress ---


class TestDeliveryAddress:
    """届け先のエンティティテスト。"""

    def test_届け先を生成できる(self):
        addr = DeliveryAddress(
            recipient_name="山田太郎",
            postal_code="100-0001",
            address="東京都千代田区千代田1-1",
            phone="03-1234-5678",
        )
        assert addr.recipient_name == "山田太郎"
        assert addr.postal_code == "100-0001"

    def test_氏名が空でエラー(self):
        with pytest.raises(ValueError):
            DeliveryAddress(
                recipient_name="",
                postal_code="100-0001",
                address="東京都",
                phone="03-1234-5678",
            )

    def test_住所が空でエラー(self):
        with pytest.raises(ValueError):
            DeliveryAddress(
                recipient_name="山田太郎",
                postal_code="100-0001",
                address="",
                phone="03-1234-5678",
            )


# --- OrderLine ---


class TestOrderLine:
    """注文明細のテスト。"""

    def test_注文明細を生成できる(self):
        line = OrderLine(
            product_id=1,
            product_name="バースデーブーケ",
            unit_price=Decimal("5000"),
            quantity=1,
        )
        assert line.subtotal == Decimal("5000")

    def test_数量2の小計(self):
        line = OrderLine(
            product_id=1,
            product_name="バースデーブーケ",
            unit_price=Decimal("5000"),
            quantity=2,
        )
        assert line.subtotal == Decimal("10000")

    def test_数量0でエラー(self):
        with pytest.raises(ValueError):
            OrderLine(
                product_id=1,
                product_name="ブーケ",
                unit_price=Decimal("5000"),
                quantity=0,
            )


# --- Order ---


class TestOrder:
    """Order 集約のテスト。"""

    def _make_order(self, **kwargs):
        defaults = {
            "id": None,
            "order_number": OrderNumber("ORD-20260324-001"),
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
                    product_id=1,
                    product_name="バースデーブーケ",
                    unit_price=Decimal("5000"),
                    quantity=1,
                ),
            ],
        }
        defaults.update(kwargs)
        return Order(**defaults)

    def test_注文を生成できる(self):
        order = self._make_order()
        assert order.order_number == OrderNumber("ORD-20260324-001")
        assert order.status == OrderStatus.PENDING

    def test_合計金額を計算できる(self):
        order = self._make_order(
            lines=[
                OrderLine(
                    product_id=1,
                    product_name="ブーケA",
                    unit_price=Decimal("5000"),
                    quantity=1,
                ),
                OrderLine(
                    product_id=2,
                    product_name="ブーケB",
                    unit_price=Decimal("3000"),
                    quantity=2,
                ),
            ]
        )
        assert order.total_amount == Decimal("11000")

    def test_注文を確定できる(self):
        order = self._make_order()
        order.confirm()
        assert order.status == OrderStatus.CONFIRMED

    def test_確定済み注文を再確定するとエラー(self):
        order = self._make_order()
        order.confirm()
        with pytest.raises(ValueError):
            order.confirm()

    def test_明細なしで生成するとエラー(self):
        with pytest.raises(ValueError):
            self._make_order(lines=[])
