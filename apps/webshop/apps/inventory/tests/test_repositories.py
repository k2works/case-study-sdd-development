"""在庫ロット Repository の統合テスト。"""

from datetime import date

import pytest

from apps.inventory.domain.entities import StockLot
from apps.inventory.domain.value_objects import ExpiryDate, StockLotStatus
from apps.inventory.repositories import DjangoStockLotRepository
from apps.products.models import Item, Supplier


@pytest.mark.django_db
class TestDjangoStockLotRepository:
    """在庫ロット Repository の統合テスト。"""

    def setup_method(self):
        self.repo = DjangoStockLotRepository()
        self.supplier = Supplier.objects.create(name="花卉市場A")
        self.item = Item.objects.create(
            name="赤バラ",
            quality_retention_days=7,
            purchase_unit=10,
            lead_time_days=2,
            supplier=self.supplier,
        )

    def _make_lot(self, **kwargs) -> StockLot:
        defaults = {
            "id": None,
            "item_id": self.item.pk,
            "quantity": 100,
            "remaining_quantity": 100,
            "arrived_at": date(2026, 4, 1),
            "expiry_date": ExpiryDate(date(2026, 4, 7)),
            "status": StockLotStatus.AVAILABLE,
        }
        defaults.update(kwargs)
        return StockLot(**defaults)

    def test_新規保存してIDが採番される(self):
        lot = self._make_lot()
        saved = self.repo.save(lot)
        assert saved.id is not None
        assert saved.item_id == self.item.pk
        assert saved.quantity == 100

    def test_IDで取得できる(self):
        lot = self._make_lot()
        saved = self.repo.save(lot)
        found = self.repo.find_by_id(saved.id)
        assert found is not None
        assert found.item_id == self.item.pk
        assert found.remaining_quantity == 100

    def test_存在しないIDはNone(self):
        assert self.repo.find_by_id(9999) is None

    def test_単品IDで検索できる(self):
        self.repo.save(self._make_lot())
        self.repo.save(self._make_lot(expiry_date=ExpiryDate(date(2026, 4, 10))))
        lots = self.repo.find_by_item_id(self.item.pk)
        assert len(lots) == 2

    def test_期限内のアクティブロットのみ取得(self):
        # 期限内ロット
        self.repo.save(self._make_lot(expiry_date=ExpiryDate(date(2026, 4, 7))))
        # 期限切れロット（as_of=4/5 で期限 4/3 → 期限切れ）
        self.repo.save(
            self._make_lot(
                expiry_date=ExpiryDate(date(2026, 4, 3)),
                status=StockLotStatus.EXPIRED,
            )
        )
        # 残数量0ロット
        self.repo.save(
            self._make_lot(
                remaining_quantity=0,
                status=StockLotStatus.DEPLETED,
            )
        )
        active = self.repo.find_active_by_item_id(self.item.pk, as_of=date(2026, 4, 5))
        assert len(active) == 1
        assert active[0].expiry_date.value == date(2026, 4, 7)

    def test_更新が反映される(self):
        lot = self._make_lot()
        saved = self.repo.save(lot)
        saved.remaining_quantity = 50
        saved.status = StockLotStatus.NEAR_EXPIRY
        updated = self.repo.save(saved)
        assert updated.remaining_quantity == 50
        assert updated.status == StockLotStatus.NEAR_EXPIRY

    def test_ドメインエンティティに正しく変換される(self):
        lot = self._make_lot()
        saved = self.repo.save(lot)
        found = self.repo.find_by_id(saved.id)
        assert isinstance(found.expiry_date, ExpiryDate)
        assert isinstance(found.status, StockLotStatus)
