"""商品管理の DRF シリアライザ（プレゼンテーション層）。"""

from rest_framework import serializers

from apps.products.models import Composition, Item, Product, Supplier


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


class CompositionSerializer(serializers.ModelSerializer):
    item = ItemSerializer(read_only=True)

    class Meta:
        model = Composition
        fields = ["id", "item", "quantity"]


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


class ProductDetailSerializer(serializers.ModelSerializer):
    """商品詳細（構成花材含む）。"""

    compositions = CompositionSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "description",
            "price",
            "image_url",
            "is_active",
            "compositions",
        ]
