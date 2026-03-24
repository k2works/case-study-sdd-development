"""商品管理の URL ルーティング。"""

from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.products.views import ItemViewSet, SupplierViewSet

router = DefaultRouter()
router.register("items", ItemViewSet, basename="item")
router.register("suppliers", SupplierViewSet, basename="supplier")

urlpatterns = [
    path("", include(router.urls)),
]
