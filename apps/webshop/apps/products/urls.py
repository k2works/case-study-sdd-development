"""商品管理の URL ルーティング。"""

from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.products.views import ItemViewSet, ProductViewSet

router = DefaultRouter()
router.register("products", ProductViewSet, basename="product")
router.register("items", ItemViewSet, basename="item")

urlpatterns = [
    path("", include(router.urls)),
]
