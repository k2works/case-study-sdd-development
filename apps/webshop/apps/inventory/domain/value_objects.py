"""在庫ドメインの値オブジェクト定義。

ExpiryDate, StockLotStatus の各値オブジェクトを定義する。
"""

from __future__ import annotations

import enum
from dataclasses import dataclass
from datetime import date, timedelta


@dataclass(frozen=True)
class ExpiryDate:
    """品質維持期限。入荷日 + 品質維持日数 - 1 で算出。"""

    value: date

    @classmethod
    def calculate(cls, arrived_at: date, retention_days: int) -> ExpiryDate:
        """入荷日と品質維持日数から期限日を算出する。"""
        return cls(value=arrived_at + timedelta(days=retention_days - 1))

    def days_remaining(self, current_date: date) -> int:
        """現在日からの残日数を返す。"""
        return (self.value - current_date).days

    def is_near_expiry(self, current_date: date) -> bool:
        """品質維持期限まで残り 2 日以内かを判定する。"""
        remaining = self.days_remaining(current_date)
        return 0 <= remaining <= 2


class StockLotStatus(enum.Enum):
    """在庫ロットステータス。"""

    AVAILABLE = "available"
    NEAR_EXPIRY = "near_expiry"
    EXPIRED = "expired"
    DEPLETED = "depleted"
