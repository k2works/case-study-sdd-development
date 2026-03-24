"""顧客向け商品閲覧画面の URL ルーティング。"""

from django.urls import path

from apps.products.shop_views import ProductDetailView, ProductListView

app_name = "shop"

urlpatterns = [
    path("", ProductListView.as_view(), name="product_list"),
    path("<int:pk>/", ProductDetailView.as_view(), name="product_detail"),
]
