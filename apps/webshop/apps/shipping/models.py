"""出荷管理の Django ORM モデル。

インフラストラクチャ層として、出荷の永続化を担当する。
"""

from django.db import models

from apps.orders.models import Order


class Shipment(models.Model):
    """出荷 ORM モデル。"""

    order = models.OneToOneField(
        Order,
        on_delete=models.PROTECT,
        related_name="shipment",
        verbose_name="受注",
    )
    shipped_at = models.DateTimeField("出荷日時")
    notified_at = models.DateTimeField("通知日時", null=True, blank=True)
    created_at = models.DateTimeField("作成日時", auto_now_add=True)

    class Meta:
        db_table = "shipping_shipment"
        verbose_name = "出荷"
        verbose_name_plural = "出荷"
        ordering = ["-shipped_at"]

    def __str__(self) -> str:
        return f"SHP-{self.pk} (注文: {self.order_id})"
