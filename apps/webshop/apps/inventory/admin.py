"""在庫管理の Django Admin 設定。"""

from django.contrib import admin

from apps.inventory.models import StockLot


@admin.register(StockLot)
class StockLotAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "item",
        "quantity",
        "remaining_quantity",
        "arrived_at",
        "expiry_date",
        "status",
    )
    list_filter = ("status", "item")
    search_fields = ("item__name",)
    date_hierarchy = "arrived_at"
