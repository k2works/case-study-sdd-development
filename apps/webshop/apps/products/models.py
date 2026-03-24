"""商品管理の Django ORM モデル。

インフラストラクチャ層として、ドメインエンティティの永続化を担当する。
"""

from django.db import models


class Supplier(models.Model):
    """仕入先モデル。"""

    name = models.CharField("仕入先名", max_length=100)
    contact_info = models.TextField("連絡先情報", blank=True, default="")
    created_at = models.DateTimeField("作成日時", auto_now_add=True)
    updated_at = models.DateTimeField("更新日時", auto_now=True)

    class Meta:
        db_table = "products_supplier"
        verbose_name = "仕入先"
        verbose_name_plural = "仕入先"

    def __str__(self) -> str:
        return self.name


class Item(models.Model):
    """単品（花）モデル。"""

    name = models.CharField("単品名", max_length=100)
    quality_retention_days = models.PositiveIntegerField("品質維持日数")
    purchase_unit = models.PositiveIntegerField("購入単位")
    lead_time_days = models.PositiveIntegerField("リードタイム（日）", default=0)
    supplier = models.ForeignKey(
        Supplier,
        on_delete=models.PROTECT,
        related_name="items",
        verbose_name="仕入先",
    )
    is_active = models.BooleanField("有効", default=True)
    created_at = models.DateTimeField("作成日時", auto_now_add=True)
    updated_at = models.DateTimeField("更新日時", auto_now=True)

    class Meta:
        db_table = "products_item"
        verbose_name = "単品"
        verbose_name_plural = "単品"

    def __str__(self) -> str:
        return self.name


class Product(models.Model):
    """商品（花束）モデル。"""

    name = models.CharField("商品名", max_length=100)
    description = models.TextField("説明", blank=True, default="")
    price = models.DecimalField("価格", max_digits=10, decimal_places=2)
    image_url = models.URLField("画像URL", max_length=500, blank=True, default="")
    is_active = models.BooleanField("有効", default=True)
    created_at = models.DateTimeField("作成日時", auto_now_add=True)
    updated_at = models.DateTimeField("更新日時", auto_now=True)

    class Meta:
        db_table = "products_product"
        verbose_name = "商品"
        verbose_name_plural = "商品"

    def __str__(self) -> str:
        return self.name
