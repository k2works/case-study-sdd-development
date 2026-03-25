"""仕入管理の URL ルーティング。"""

from django.urls import path

from apps.purchasing.views import (
    ArrivalCreateView,
    ExpiryAlertView,
    PurchaseOrderCreateView,
    PurchaseOrderListView,
)

app_name = "purchasing"

urlpatterns = [
    path("orders/", PurchaseOrderListView.as_view(), name="order_list"),
    path("orders/new/", PurchaseOrderCreateView.as_view(), name="order_create"),
    path("arrivals/new/", ArrivalCreateView.as_view(), name="arrival_create"),
    path("alerts/expiry/", ExpiryAlertView.as_view(), name="expiry_alert"),
]
