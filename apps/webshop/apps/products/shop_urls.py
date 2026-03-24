"""顧客向け画面の URL ルーティング。"""

from django.urls import path

from apps.orders.views import OrderCompleteView, OrderFormView
from apps.products.shop_views import ProductDetailView, ProductListView

app_name = "shop"

urlpatterns = [
    path("", ProductListView.as_view(), name="product_list"),
    path("<int:pk>/", ProductDetailView.as_view(), name="product_detail"),
    path("<int:pk>/order/", OrderFormView.as_view(), name="order_form"),
    path(
        "order/<int:pk>/complete/",
        OrderCompleteView.as_view(),
        name="order_complete",
    ),
]
