"""在庫推移画面の View。"""

from datetime import date

from django.shortcuts import get_object_or_404, render
from django.views import View

from apps.inventory.repositories import DjangoStockLotRepository
from apps.inventory.services import InventoryService
from apps.products.models import Item


def _get_inventory_service() -> InventoryService:
    return InventoryService(stock_lot_repo=DjangoStockLotRepository())


class StockForecastView(View):
    """在庫推移一覧画面。単品を選択して 14 日間の在庫推移を表示する。"""

    def get(self, request):
        items = Item.objects.filter(is_active=True).order_by("name")
        item_id = request.GET.get("item_id")
        forecast = None

        if item_id:
            item = get_object_or_404(Item, pk=item_id, is_active=True)
            service = _get_inventory_service()
            forecast = service.get_item_forecast(
                item_id=item.pk,
                item_name=item.name,
                start_date=date.today(),
                days=14,
            )

        return render(
            request,
            "shop/stock_forecast.html",
            {
                "items": items,
                "selected_item_id": int(item_id) if item_id else None,
                "forecast": forecast,
            },
        )
