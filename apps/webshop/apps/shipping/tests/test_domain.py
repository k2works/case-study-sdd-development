"""出荷ドメイン層のユニットテスト。"""

from datetime import datetime

from apps.shipping.domain.entities import (
    BundlingItem,
    BundlingSummary,
    BundlingTarget,
    Shipment,
)


class TestShipment:
    """出荷エンティティのテスト。"""

    def test_出荷を生成できる(self):
        s = Shipment(
            id=1,
            order_id=1,
            shipped_at=datetime(2026, 4, 1, 10, 0),
        )
        assert s.order_id == 1
        assert s.notified_at is None

    def test_通知済みにできる(self):
        s = Shipment(
            id=1,
            order_id=1,
            shipped_at=datetime(2026, 4, 1, 10, 0),
        )
        now = datetime(2026, 4, 1, 10, 5)
        s.mark_notified(now)
        assert s.notified_at == now


class TestBundlingItem:
    """結束花材のテスト。"""

    def test_結束花材を生成できる(self):
        bi = BundlingItem(item_name="バラ（赤）", quantity=5)
        assert bi.item_name == "バラ（赤）"
        assert bi.quantity == 5


class TestBundlingTarget:
    """結束対象のテスト。"""

    def test_結束対象を生成できる(self):
        target = BundlingTarget(
            order_id=1,
            order_number="ORD-001",
            product_name="バースデーブーケ",
            recipient_name="山田太郎",
            items=[
                BundlingItem(item_name="バラ（赤）", quantity=5),
                BundlingItem(item_name="カスミソウ", quantity=3),
            ],
        )
        assert len(target.items) == 2


class TestBundlingSummary:
    """結束サマリーのテスト。"""

    def test_サマリーを生成できる(self):
        from datetime import date

        summary = BundlingSummary(
            shipping_date=date(2026, 4, 1),
            item_totals={"バラ（赤）": 10, "カスミソウ": 6},
            targets=[],
        )
        assert summary.item_totals["バラ（赤）"] == 10
