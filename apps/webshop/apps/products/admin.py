"""商品管理の Django Admin 設定。"""

from django.contrib import admin

from apps.products.models import Item, Product, Supplier


@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "contact_info", "created_at")
    search_fields = ("name",)


@admin.register(Item)
class ItemAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "name",
        "quality_retention_days",
        "purchase_unit",
        "lead_time_days",
        "supplier",
        "is_active",
    )
    list_filter = ("is_active", "supplier")
    search_fields = ("name",)


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "price", "is_active", "created_at")
    list_filter = ("is_active",)
    search_fields = ("name",)
