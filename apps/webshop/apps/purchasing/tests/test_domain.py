"""仕入ドメイン層のユニットテスト。

PurchaseOrder・Arrival エンティティ・PurchaseOrderStatus のビジネスルールを
DB 非依存でテストする。
"""

from datetime import date, datetime, timedelta

import pytest

from apps.purchasing.domain.entities import Arrival, PurchaseOrder
from apps.purchasing.domain.value_objects import PurchaseOrderStatus

# --- PurchaseOrderStatus ---


class TestPurchaseOrderStatus:
    """発注ステータスのテスト。"""

    def test_発注済みステータス(self):
        assert PurchaseOrderStatus.ORDERED.value == "ordered"

    def test_入荷済みステータス(self):
        assert PurchaseOrderStatus.ARRIVED.value == "arrived"

    def test_キャンセルステータス(self):
        assert PurchaseOrderStatus.CANCELLED.value == "cancelled"


# --- PurchaseOrder ---


class TestPurchaseOrder:
    """発注エンティティのテスト。"""

    def _make_po(self, **kwargs) -> PurchaseOrder:
        defaults = {
            "id": 1,
            "item_id": 1,
            "supplier_id": 1,
            "quantity": 100,
            "expected_arrival_date": date.today() + timedelta(days=3),
            "status": PurchaseOrderStatus.ORDERED,
            "ordered_at": datetime(2026, 3, 25, 9, 0, 0),
        }
        defaults.update(kwargs)
        return PurchaseOrder(**defaults)

    def test_発注を生成できる(self):
        po = self._make_po()
        assert po.item_id == 1
        assert po.quantity == 100
        assert po.status == PurchaseOrderStatus.ORDERED

    def test_数量0でエラー(self):
        with pytest.raises(ValueError, match="発注数量は 1 以上"):
            self._make_po(quantity=0)

    def test_過去の入荷予定日でエラー(self):
        with pytest.raises(ValueError, match="入荷予定日は未来の日付"):
            self._make_po(expected_arrival_date=date.today())

    def test_入荷処理で入荷済みに遷移する(self):
        po = self._make_po()
        po.receive()
        assert po.status == PurchaseOrderStatus.ARRIVED

    def test_入荷済みの発注は入荷処理できない(self):
        po = self._make_po(status=PurchaseOrderStatus.ARRIVED)
        with pytest.raises(ValueError, match="発注済みの注文のみ入荷処理"):
            po.receive()

    def test_キャンセルで状態遷移する(self):
        po = self._make_po()
        po.cancel()
        assert po.status == PurchaseOrderStatus.CANCELLED

    def test_入荷済みの発注はキャンセルできない(self):
        po = self._make_po(status=PurchaseOrderStatus.ARRIVED)
        with pytest.raises(ValueError, match="発注済みの注文のみキャンセル"):
            po.cancel()

    def test_キャンセル済みの発注はキャンセルできない(self):
        po = self._make_po(status=PurchaseOrderStatus.CANCELLED)
        with pytest.raises(ValueError, match="発注済みの注文のみキャンセル"):
            po.cancel()


# --- Arrival ---


class TestArrival:
    """入荷エンティティのテスト。"""

    def _make_arrival(self, **kwargs) -> Arrival:
        defaults = {
            "id": 1,
            "purchase_order_id": 1,
            "item_id": 1,
            "quantity": 100,
            "arrived_at": date(2026, 3, 28),
        }
        defaults.update(kwargs)
        return Arrival(**defaults)

    def test_入荷を生成できる(self):
        arrival = self._make_arrival()
        assert arrival.purchase_order_id == 1
        assert arrival.quantity == 100

    def test_数量0でエラー(self):
        with pytest.raises(ValueError, match="入荷数量は 1 以上"):
            self._make_arrival(quantity=0)

    def test_発注数量との差異_一致(self):
        arrival = self._make_arrival(quantity=100)
        assert arrival.quantity_variance(100) == 0

    def test_発注数量との差異_超過(self):
        arrival = self._make_arrival(quantity=120)
        assert arrival.quantity_variance(100) == 20

    def test_発注数量との差異_不足(self):
        arrival = self._make_arrival(quantity=80)
        assert arrival.quantity_variance(100) == -20
