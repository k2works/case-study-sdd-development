"""仕入ドメインの値オブジェクト定義。

PurchaseOrderStatus の値オブジェクトを定義する。
"""

from __future__ import annotations

import enum


class PurchaseOrderStatus(enum.Enum):
    """発注ステータス。"""

    ORDERED = "ordered"
    ARRIVED = "arrived"
    CANCELLED = "cancelled"
