"""在庫ドメイン層のユニットテスト。

StockLot 集約・値オブジェクト・StockForecastService のビジネスルールを
DB 非依存でテストする。
"""

from datetime import date

import pytest

from apps.inventory.domain.entities import DailyForecast, StockLot
from apps.inventory.domain.services import StockForecastService
from apps.inventory.domain.value_objects import ExpiryDate, StockLotStatus

# --- ExpiryDate ---


class TestExpiryDate:
    """品質維持期限の値オブジェクトテスト。"""

    def test_入荷日と品質維持日数から算出できる(self):
        expiry = ExpiryDate.calculate(arrived_at=date(2026, 4, 1), retention_days=7)
        assert expiry.value == date(2026, 4, 7)

    def test_品質維持日数1の場合は入荷日当日(self):
        expiry = ExpiryDate.calculate(arrived_at=date(2026, 4, 1), retention_days=1)
        assert expiry.value == date(2026, 4, 1)

    def test_残日数を取得できる(self):
        expiry = ExpiryDate(date(2026, 4, 7))
        assert expiry.days_remaining(date(2026, 4, 5)) == 2

    def test_残日数が0の場合(self):
        expiry = ExpiryDate(date(2026, 4, 7))
        assert expiry.days_remaining(date(2026, 4, 7)) == 0

    def test_期限間近判定_残り2日以内でTrue(self):
        expiry = ExpiryDate(date(2026, 4, 7))
        assert expiry.is_near_expiry(date(2026, 4, 5)) is True
        assert expiry.is_near_expiry(date(2026, 4, 6)) is True
        assert expiry.is_near_expiry(date(2026, 4, 7)) is True

    def test_期限間近判定_残り3日以上でFalse(self):
        expiry = ExpiryDate(date(2026, 4, 7))
        assert expiry.is_near_expiry(date(2026, 4, 4)) is False

    def test_期限超過判定(self):
        expiry = ExpiryDate(date(2026, 4, 7))
        assert expiry.is_near_expiry(date(2026, 4, 8)) is False

    def test_等価性(self):
        assert ExpiryDate(date(2026, 4, 7)) == ExpiryDate(date(2026, 4, 7))

    def test_不等価性(self):
        assert ExpiryDate(date(2026, 4, 7)) != ExpiryDate(date(2026, 4, 8))


# --- StockLotStatus ---


class TestStockLotStatus:
    """在庫ロットステータスのテスト。"""

    def test_利用可能ステータス(self):
        assert StockLotStatus.AVAILABLE.value == "available"

    def test_期限間近ステータス(self):
        assert StockLotStatus.NEAR_EXPIRY.value == "near_expiry"

    def test_期限切れステータス(self):
        assert StockLotStatus.EXPIRED.value == "expired"

    def test_在庫切れステータス(self):
        assert StockLotStatus.DEPLETED.value == "depleted"


# --- StockLot ---


class TestStockLot:
    """在庫ロットエンティティのテスト。"""

    def _make_lot(self, **kwargs) -> StockLot:
        defaults = {
            "id": 1,
            "item_id": 1,
            "quantity": 100,
            "remaining_quantity": 100,
            "arrived_at": date(2026, 4, 1),
            "expiry_date": ExpiryDate(date(2026, 4, 7)),
            "status": StockLotStatus.AVAILABLE,
        }
        defaults.update(kwargs)
        return StockLot(**defaults)

    def test_在庫ロットを生成できる(self):
        lot = self._make_lot()
        assert lot.item_id == 1
        assert lot.remaining_quantity == 100

    def test_引当で残数量が減る(self):
        lot = self._make_lot(remaining_quantity=50)
        allocated = lot.allocate(30)
        assert allocated == 30
        assert lot.remaining_quantity == 20

    def test_残数量を超える引当は残数量分のみ(self):
        lot = self._make_lot(remaining_quantity=10)
        allocated = lot.allocate(30)
        assert allocated == 10
        assert lot.remaining_quantity == 0

    def test_残数量0からの引当は0(self):
        lot = self._make_lot(remaining_quantity=0, status=StockLotStatus.DEPLETED)
        allocated = lot.allocate(10)
        assert allocated == 0

    def test_引当解除で残数量が増える(self):
        lot = self._make_lot(remaining_quantity=50)
        lot.deallocate(20)
        assert lot.remaining_quantity == 70

    def test_引当解除で元の数量を超えない(self):
        lot = self._make_lot(quantity=100, remaining_quantity=90)
        with pytest.raises(ValueError):
            lot.deallocate(20)

    def test_期限間近判定(self):
        lot = self._make_lot(expiry_date=ExpiryDate(date(2026, 4, 7)))
        assert lot.is_near_expiry(date(2026, 4, 5)) is True
        assert lot.is_near_expiry(date(2026, 4, 3)) is False

    def test_期限切れ判定(self):
        lot = self._make_lot(expiry_date=ExpiryDate(date(2026, 4, 7)))
        assert lot.is_expired(date(2026, 4, 7)) is False
        assert lot.is_expired(date(2026, 4, 8)) is True

    def test_数量0でエラー(self):
        with pytest.raises(ValueError):
            self._make_lot(quantity=0)

    def test_残数量が負でエラー(self):
        with pytest.raises(ValueError):
            self._make_lot(remaining_quantity=-1)


# --- StockForecastService ---


class TestStockForecastService:
    """在庫推移計算ドメインサービスのテスト。"""

    def _make_lot(self, **kwargs) -> StockLot:
        defaults = {
            "id": 1,
            "item_id": 1,
            "quantity": 100,
            "remaining_quantity": 100,
            "arrived_at": date(2026, 4, 1),
            "expiry_date": ExpiryDate(date(2026, 4, 7)),
            "status": StockLotStatus.AVAILABLE,
        }
        defaults.update(kwargs)
        return StockLot(**defaults)

    def test_1日分の在庫推移を計算できる(self):
        lot = self._make_lot()
        service = StockForecastService()
        forecasts = service.calculate_forecast(
            item_id=1, start_date=date(2026, 4, 1), days=1, stock_lots=[lot]
        )
        assert len(forecasts) == 1
        assert forecasts[0].date == date(2026, 4, 1)
        assert forecasts[0].stock_remaining == 100

    def test_期限切れロットが廃棄予定に計上される(self):
        lot = self._make_lot(
            remaining_quantity=50,
            expiry_date=ExpiryDate(date(2026, 4, 3)),
        )
        service = StockForecastService()
        forecasts = service.calculate_forecast(
            item_id=1, start_date=date(2026, 4, 1), days=5, stock_lots=[lot]
        )
        # 4/3 に期限切れ → 4/4 以降は在庫ゼロ
        assert forecasts[2].date == date(2026, 4, 3)
        assert forecasts[2].expiring == 50
        assert forecasts[3].stock_remaining == 0

    def test_複数ロットの在庫推移(self):
        lot1 = self._make_lot(
            id=1, remaining_quantity=30,
            expiry_date=ExpiryDate(date(2026, 4, 3)),
        )
        lot2 = self._make_lot(
            id=2, remaining_quantity=50,
            expiry_date=ExpiryDate(date(2026, 4, 5)),
        )
        service = StockForecastService()
        forecasts = service.calculate_forecast(
            item_id=1, start_date=date(2026, 4, 1), days=7, stock_lots=[lot1, lot2]
        )
        # 4/1: 30+50=80
        assert forecasts[0].stock_remaining == 80
        # 4/3: lot1 期限切れ → expiring=30
        assert forecasts[2].expiring == 30
        # 4/4: lot2 のみ残る → 50
        assert forecasts[3].stock_remaining == 50
        # 4/5: lot2 期限切れ → expiring=50
        assert forecasts[4].expiring == 50
        # 4/6: 在庫ゼロ
        assert forecasts[5].stock_remaining == 0

    def test_在庫ロットなしの場合すべてゼロ(self):
        service = StockForecastService()
        forecasts = service.calculate_forecast(
            item_id=1, start_date=date(2026, 4, 1), days=3, stock_lots=[]
        )
        assert len(forecasts) == 3
        assert all(f.stock_remaining == 0 for f in forecasts)
        assert all(f.expiring == 0 for f in forecasts)

    def test_outgoing_とincoming_はIT3では常に0(self):
        lot = self._make_lot()
        service = StockForecastService()
        forecasts = service.calculate_forecast(
            item_id=1, start_date=date(2026, 4, 1), days=3, stock_lots=[lot]
        )
        assert all(f.outgoing_planned == 0 for f in forecasts)
        assert all(f.incoming_planned == 0 for f in forecasts)


# --- DailyForecast ---


class TestDailyForecast:
    """日次在庫予測の値オブジェクトテスト。"""

    def test_日次予測を生成できる(self):
        forecast = DailyForecast(
            date=date(2026, 4, 1),
            stock_remaining=100,
            outgoing_planned=0,
            incoming_planned=0,
            expiring=0,
        )
        assert forecast.stock_remaining == 100
        assert forecast.date == date(2026, 4, 1)
