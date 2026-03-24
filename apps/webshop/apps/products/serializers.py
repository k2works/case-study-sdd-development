"""商品管理の DRF シリアライザ（プレゼンテーション層）。"""

from rest_framework import serializers

from apps.products.models import Item, Product, Supplier


class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = ["id", "name", "contact_info"]


class ItemSerializer(serializers.ModelSerializer):
    supplier = SupplierSerializer(read_only=True)

    class Meta:
        model = Item
        fields = [
            "id",
            "name",
            "quality_retention_days",
            "purchase_unit",
            "lead_time_days",
            "supplier",
            "is_active",
        ]


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "description",
            "price",
            "image_url",
            "is_active",
        ]
