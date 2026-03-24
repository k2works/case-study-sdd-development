"""InventoryService のユニットテスト。"""

from datetime import date

from apps.inventory.domain.entities import StockLot
from apps.inventory.domain.interfaces import StockLotRepository
from apps.inventory.domain.value_objects import ExpiryDate, StockLotStatus
from apps.inventory.services import InventoryService


class InMemoryStockLotRepository(StockLotRepository):
    """テスト用インメモリ Repository。"""

    def __init__(self, lots: list[StockLot] | None = None):
        self._lots = lots or []

    def find_by_id(self, stock_lot_id: int) -> StockLot | None:
        return next((lot for lot in self._lots if lot.id == stock_lot_id), None)

    def find_by_item_id(self, item_id: int) -> list[StockLot]:
        return [lot for lot in self._lots if lot.item_id == item_id]

    def find_active_by_item_id(self, item_id: int, as_of: date) -> list[StockLot]:
        return [
            lot
            for lot in self._lots
            if lot.item_id == item_id
            and lot.expiry_date.days_remaining(as_of) > 0
            and lot.remaining_quantity > 0
        ]

    def save(self, stock_lot: StockLot) -> StockLot:
        if stock_lot.id is None:
            stock_lot.id = len(self._lots) + 1
        self._lots.append(stock_lot)
        return stock_lot


class TestInventoryService:
    """InventoryService のテスト。"""

    def _make_lot(self, **kwargs) -> StockLot:
        defaults = {
            "id": 1,
            "item_id": 1,
            "quantity": 100,
            "remaining_quantity": 100,
            "arrived_at": date(2026, 4, 1),
            "expiry_date": ExpiryDate(date(2026, 4, 14)),
            "status": StockLotStatus.AVAILABLE,
        }
        defaults.update(kwargs)
        return StockLot(**defaults)

    def test_在庫推移を取得できる(self):
        lot = self._make_lot()
        repo = InMemoryStockLotRepository([lot])
        service = InventoryService(stock_lot_repo=repo)
        result = service.get_item_forecast(
            item_id=1, item_name="赤バラ", start_date=date(2026, 4, 1), days=7
        )
        assert result.item_name == "赤バラ"
        assert len(result.forecasts) == 7
        assert result.forecasts[0].stock_remaining == 100

    def test_在庫ロットなしの場合(self):
        repo = InMemoryStockLotRepository([])
        service = InventoryService(stock_lot_repo=repo)
        result = service.get_item_forecast(
            item_id=1, item_name="赤バラ", start_date=date(2026, 4, 1), days=7
        )
        assert all(f.stock_remaining == 0 for f in result.forecasts)

    def test_デフォルト14日間(self):
        repo = InMemoryStockLotRepository([])
        service = InventoryService(stock_lot_repo=repo)
        result = service.get_item_forecast(
            item_id=1, item_name="赤バラ", start_date=date(2026, 4, 1)
        )
        assert len(result.forecasts) == 14
