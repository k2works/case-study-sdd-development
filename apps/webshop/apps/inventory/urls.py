"""在庫管理の URL ルーティング。"""

from django.urls import path

from apps.inventory.views import StockForecastView

app_name = "inventory"

urlpatterns = [
    path("forecast/", StockForecastView.as_view(), name="stock_forecast"),
]
