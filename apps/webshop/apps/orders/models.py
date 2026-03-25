"""受注管理の Django ORM モデル。"""

from django.db import models

from apps.products.models import Product


class Order(models.Model):
    """注文。"""

    order_number = models.CharField("注文番号", max_length=30, unique=True)
    status = models.CharField(
        "ステータス",
        max_length=20,
        choices=[
            ("pending", "保留中"),
            ("confirmed", "確定"),
            ("cancelled", "キャンセル"),
        ],
        default="pending",
    )
    # 届け先
    recipient_name = models.CharField("届け先氏名", max_length=100)
    postal_code = models.CharField("郵便番号", max_length=10)
    address = models.CharField("届け先住所", max_length=300)
    phone = models.CharField("電話番号", max_length=20)
    # 届け日・メッセージ
    delivery_date = models.DateField("届け日")
    message = models.TextField("メッセージ", blank=True, default="")
    # タイムスタンプ
    created_at = models.DateTimeField("作成日時", auto_now_add=True)
    updated_at = models.DateTimeField("更新日時", auto_now=True)

    class Meta:
        db_table = "orders_order"
        verbose_name = "注文"
        verbose_name_plural = "注文"
        ordering = ["-created_at"]

    @property
    def total(self):
        """合計金額を算出する。"""
        return sum(line.subtotal for line in self.lines.all())

    def __str__(self):
        return self.order_number


class OrderLine(models.Model):
    """注文明細。"""

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="lines")
    product = models.ForeignKey(Product, on_delete=models.PROTECT, verbose_name="商品")
    product_name = models.CharField("商品名（注文時点）", max_length=100)
    unit_price = models.DecimalField(
        "単価（注文時点）", max_digits=10, decimal_places=2
    )
    quantity = models.PositiveIntegerField("数量", default=1)

    @property
    def subtotal(self):
        """小計を算出する。"""
        return self.unit_price * self.quantity

    class Meta:
        db_table = "orders_order_line"
        verbose_name = "注文明細"
        verbose_name_plural = "注文明細"

    def __str__(self):
        return f"{self.product_name} x{self.quantity}"
