"""出荷管理の URL ルーティング。"""

from django.urls import path

from apps.shipping.views import BundlingListView, ShipmentListView

app_name = "shipping"

urlpatterns = [
    path(
        "bundling/",
        BundlingListView.as_view(),
        name="bundling_list",
    ),
    path(
        "shipments/",
        ShipmentListView.as_view(),
        name="shipment_list",
    ),
]
