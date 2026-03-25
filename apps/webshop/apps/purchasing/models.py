"""仕入管理の Django ORM モデル。

インフラストラクチャ層として、発注・入荷の永続化を担当する。
"""

from django.db import models

from apps.products.models import Item, Supplier


class PurchaseOrder(models.Model):
    """発注 ORM モデル。"""

    STATUS_CHOICES = [
        ("ordered", "発注済み"),
        ("arrived", "入荷済み"),
        ("cancelled", "キャンセル"),
    ]

    item = models.ForeignKey(
        Item,
        on_delete=models.PROTECT,
        related_name="purchase_orders",
        verbose_name="単品",
    )
    supplier = models.ForeignKey(
        Supplier,
        on_delete=models.PROTECT,
        related_name="purchase_orders",
        verbose_name="仕入先",
    )
    quantity = models.PositiveIntegerField("発注数量")
    expected_arrival_date = models.DateField("入荷予定日")
    status = models.CharField(
        "ステータス",
        max_length=20,
        choices=STATUS_CHOICES,
        default="ordered",
    )
    ordered_at = models.DateTimeField("発注日時", auto_now_add=True)
    created_at = models.DateTimeField("作成日時", auto_now_add=True)
    updated_at = models.DateTimeField("更新日時", auto_now=True)

    class Meta:
        db_table = "purchasing_purchase_order"
        verbose_name = "発注"
        verbose_name_plural = "発注"
        ordering = ["-ordered_at"]

    def __str__(self) -> str:
        return f"PO-{self.pk} {self.item.name} x{self.quantity}"


class Arrival(models.Model):
    """入荷 ORM モデル。"""

    purchase_order = models.ForeignKey(
        PurchaseOrder,
        on_delete=models.PROTECT,
        related_name="arrivals",
        verbose_name="発注",
    )
    item = models.ForeignKey(
        Item,
        on_delete=models.PROTECT,
        related_name="arrivals",
        verbose_name="単品",
    )
    quantity = models.PositiveIntegerField("入荷数量")
    arrived_at = models.DateField("入荷日")
    created_at = models.DateTimeField("作成日時", auto_now_add=True)

    class Meta:
        db_table = "purchasing_arrival"
        verbose_name = "入荷"
        verbose_name_plural = "入荷"
        ordering = ["-arrived_at"]

    def __str__(self) -> str:
        return f"ARR-{self.pk} {self.item.name} x{self.quantity}"
