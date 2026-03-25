"""スタッフ向け受注管理の URL ルーティング。"""

from django.urls import path

from apps.orders.views import StaffOrderDetailView, StaffOrderListView

app_name = "staff_orders"

urlpatterns = [
    path("", StaffOrderListView.as_view(), name="order_list"),
    path("<int:pk>/", StaffOrderDetailView.as_view(), name="order_detail"),
]
