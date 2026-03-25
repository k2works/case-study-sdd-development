"""在庫管理の Django ORM モデル。

インフラストラクチャ層として、在庫ロットの永続化を担当する。
"""

from django.db import models

from apps.products.models import Item


class StockLot(models.Model):
    """在庫ロット ORM モデル。"""

    STATUS_CHOICES = [
        ("available", "利用可能"),
        ("near_expiry", "期限間近"),
        ("expired", "期限切れ"),
        ("depleted", "在庫切れ"),
    ]

    item = models.ForeignKey(
        Item,
        on_delete=models.PROTECT,
        related_name="stock_lots",
        verbose_name="単品",
    )
    quantity = models.PositiveIntegerField("入荷数量")
    remaining_quantity = models.PositiveIntegerField("残数量")
    arrived_at = models.DateField("入荷日")
    expiry_date = models.DateField("品質維持期限")
    status = models.CharField(
        "ステータス",
        max_length=20,
        choices=STATUS_CHOICES,
        default="available",
    )
    created_at = models.DateTimeField("作成日時", auto_now_add=True)
    updated_at = models.DateTimeField("更新日時", auto_now=True)

    class Meta:
        db_table = "inventory_stocklot"
        verbose_name = "在庫ロット"
        verbose_name_plural = "在庫ロット"
        ordering = ["expiry_date"]

    def __str__(self) -> str:
        return f"{self.item.name} ({self.arrived_at}) x{self.remaining_quantity}"
