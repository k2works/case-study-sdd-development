"""顧客向け画面の URL ルーティング。"""

from django.urls import path

from apps.orders.views import (
    AddressSelectView,
    ChangeDeliveryDateView,
    OrderCancelView,
    OrderCompleteView,
    OrderFormView,
    OrderHistoryDetailView,
    OrderHistoryView,
)
from apps.products.shop_views import ProductDetailView, ProductListView

app_name = "shop"

urlpatterns = [
    path("", ProductListView.as_view(), name="product_list"),
    path("<int:pk>/", ProductDetailView.as_view(), name="product_detail"),
    path("<int:pk>/order/", OrderFormView.as_view(), name="order_form"),
    path(
        "<int:pk>/order/addresses/",
        AddressSelectView.as_view(),
        name="address_select",
    ),
    path(
        "order/<int:pk>/complete/",
        OrderCompleteView.as_view(),
        name="order_complete",
    ),
    path("order/cancel/", OrderCancelView.as_view(), name="order_cancel"),
    path("order/history/", OrderHistoryView.as_view(), name="order_history"),
    path(
        "order/<str:order_number>/",
        OrderHistoryDetailView.as_view(),
        name="order_history_detail",
    ),
    path(
        "order/<str:order_number>/change-date/",
        ChangeDeliveryDateView.as_view(),
        name="change_delivery_date",
    ),
]
