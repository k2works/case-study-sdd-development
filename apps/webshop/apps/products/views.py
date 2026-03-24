"""商品管理の DRF ViewSet（プレゼンテーション層）。"""

from rest_framework import viewsets
from rest_framework.permissions import AllowAny

from apps.products.models import Item, Product
from apps.products.serializers import (
    ItemSerializer,
    ProductDetailSerializer,
    ProductSerializer,
)


class ItemViewSet(viewsets.ReadOnlyModelViewSet):
    """単品の読み取り専用 API（有効な単品のみ）。"""

    serializer_class = ItemSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return Item.objects.filter(is_active=True).select_related("supplier")


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    """商品の読み取り専用 API（有効な商品のみ、認証不要）。"""

    permission_classes = [AllowAny]

    def get_serializer_class(self):
        if self.action == "retrieve":
            return ProductDetailSerializer
        return ProductSerializer

    def get_queryset(self):
        qs = Product.objects.filter(is_active=True).order_by("name")
        if self.action == "retrieve":
            qs = qs.prefetch_related("compositions__item__supplier")
        return qs
