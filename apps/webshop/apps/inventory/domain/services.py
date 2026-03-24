"""在庫ドメインサービス。

StockForecastService が単品ごとの日別在庫推移を計算する。
"""

from __future__ import annotations

from datetime import date, timedelta

from apps.inventory.domain.entities import DailyForecast, StockLot


class StockForecastService:
    """在庫推移計算ドメインサービス。

    IT3 では引当なし（outgoing_planned / incoming_planned は常に 0）。
    在庫ロットの品質維持期限に基づく廃棄予定のみを計算する。
    """

    def calculate_forecast(
        self,
        item_id: int,
        start_date: date,
        days: int,
        stock_lots: list[StockLot],
    ) -> list[DailyForecast]:
        """日別在庫推移を計算する。"""
        forecasts: list[DailyForecast] = []
        # ロットごとの残数量を追跡するためにコピー
        lot_remaining = {lot.id: lot.remaining_quantity for lot in stock_lots}

        for i in range(days):
            current_date = start_date + timedelta(days=i)
            expiring = 0

            # 当日に期限切れとなるロットの廃棄数量を計算
            for lot in stock_lots:
                if lot.expiry_date.value == current_date and lot_remaining[lot.id] > 0:
                    expiring += lot_remaining[lot.id]

            # 在庫残 = 全ロットの残数量 - 当日廃棄分
            stock_remaining = sum(lot_remaining.values()) - expiring

            forecasts.append(
                DailyForecast(
                    date=current_date,
                    stock_remaining=stock_remaining,
                    outgoing_planned=0,
                    incoming_planned=0,
                    expiring=expiring,
                )
            )

            # 期限切れロットの残数量をゼロにする（翌日以降に反映）
            for lot in stock_lots:
                if lot.expiry_date.value == current_date:
                    lot_remaining[lot.id] = 0

        return forecasts
