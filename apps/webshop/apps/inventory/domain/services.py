"""在庫ドメインサービス。

StockForecastService が単品ごとの日別在庫推移を計算する。
"""

from __future__ import annotations

from datetime import date, timedelta

from apps.inventory.domain.entities import DailyForecast, StockLot


class StockForecastService:
    """在庫推移計算ドメインサービス。

    在庫ロットの品質維持期限に基づく廃棄予定と、
    発注の入荷予定日に基づく入荷予定を計算する。
    """

    def calculate_forecast(
        self,
        start_date: date,
        days: int,
        stock_lots: list[StockLot],
        incoming_schedule: dict[date, int] | None = None,
    ) -> list[DailyForecast]:
        """日別在庫推移を計算する。

        Args:
            item_id: 単品 ID
            start_date: 開始日
            days: 日数
            stock_lots: 在庫ロット一覧
            incoming_schedule: 入荷予定 {日付: 数量} の辞書
        """
        if incoming_schedule is None:
            incoming_schedule = {}

        forecasts: list[DailyForecast] = []
        # ロットごとの残数量を追跡するためにコピー
        lot_remaining = {lot.id: lot.remaining_quantity for lot in stock_lots}
        # 入荷予定による累積増分
        cumulative_incoming = 0

        for i in range(days):
            current_date = start_date + timedelta(days=i)
            expiring = 0
            incoming = incoming_schedule.get(current_date, 0)
            cumulative_incoming += incoming

            # 当日に期限切れとなるロットの廃棄数量を計算
            for lot in stock_lots:
                if lot.expiry_date.value == current_date and lot_remaining[lot.id] > 0:
                    expiring += lot_remaining[lot.id]

            lot_total = sum(lot_remaining.values())
            stock_remaining = lot_total - expiring + cumulative_incoming

            forecasts.append(
                DailyForecast(
                    date=current_date,
                    stock_remaining=stock_remaining,
                    outgoing_planned=0,
                    incoming_planned=incoming,
                    expiring=expiring,
                )
            )

            # 期限切れロットの残数量をゼロにする（翌日以降に反映）
            for lot in stock_lots:
                if lot.expiry_date.value == current_date:
                    lot_remaining[lot.id] = 0

        return forecasts
