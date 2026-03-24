"""商品管理の DRF ViewSet（プレゼンテーション層）。"""

from rest_framework import viewsets
from rest_framework.permissions import AllowAny

from apps.products.models import Item, Supplier
from apps.products.serializers import ItemSerializer, SupplierSerializer


class SupplierViewSet(viewsets.ReadOnlyModelViewSet):
    """仕入先の読み取り専用 API。"""

    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
    permission_classes = [AllowAny]


class ItemViewSet(viewsets.ReadOnlyModelViewSet):
    """単品の読み取り専用 API（有効な単品のみ）。"""

    serializer_class = ItemSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return Item.objects.filter(is_active=True).select_related("supplier")
