"""在庫管理のアプリケーションサービス。"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date

from apps.inventory.domain.entities import DailyForecast
from apps.inventory.domain.interfaces import StockLotRepository
from apps.inventory.domain.services import StockForecastService
from apps.purchasing.domain.interfaces import PurchaseOrderRepository


@dataclass(frozen=True)
class ItemForecast:
    """単品ごとの在庫推移結果。"""

    item_id: int
    item_name: str
    forecasts: list[DailyForecast]


class InventoryService:
    """在庫管理のアプリケーションサービス。"""

    def __init__(
        self,
        stock_lot_repo: StockLotRepository,
        po_repo: PurchaseOrderRepository | None = None,
    ):
        self._stock_lot_repo = stock_lot_repo
        self._po_repo = po_repo
        self._forecast_service = StockForecastService()

    def get_item_forecast(
        self,
        item_id: int,
        item_name: str,
        start_date: date,
        days: int = 14,
    ) -> ItemForecast:
        """単品の在庫推移を取得する。"""
        lots = self._stock_lot_repo.find_active_by_item_id(item_id, as_of=start_date)

        # 入荷予定を発注データから取得
        incoming_schedule: dict[date, int] = {}
        if self._po_repo is not None:
            ordered = self._po_repo.find_ordered_by_item_id(item_id)
            for po in ordered:
                d = po.expected_arrival_date
                incoming_schedule[d] = incoming_schedule.get(d, 0) + po.quantity

        forecasts = self._forecast_service.calculate_forecast(
            start_date=start_date,
            days=days,
            stock_lots=lots,
            incoming_schedule=incoming_schedule,
        )
        return ItemForecast(
            item_id=item_id,
            item_name=item_name,
            forecasts=forecasts,
        )
