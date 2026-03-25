"""出荷管理画面の View。"""

from datetime import date

from django.shortcuts import redirect, render
from django.views import View

from apps.orders.repositories import DjangoOrderRepository
from apps.shipping.repositories import DjangoShipmentRepository
from apps.shipping.services import ShippingService


def _get_service() -> ShippingService:
    return ShippingService(
        order_repo=DjangoOrderRepository(),
        shipment_repo=DjangoShipmentRepository(),
    )


class BundlingListView(View):
    """結束一覧画面（US-010）。"""

    def get(self, request):
        service = _get_service()
        summary = service.get_bundling_summary(shipping_date=date.today())
        return render(
            request,
            "staff/bundling_list.html",
            {"summary": summary},
        )


class ShipmentListView(View):
    """出荷管理画面（US-011）。"""

    def get(self, request):
        service = _get_service()
        orders = service.list_shippable_orders(shipping_date=date.today())
        return render(
            request,
            "staff/shipment_list.html",
            {"orders": orders, "order_count": len(orders)},
        )

    def post(self, request):
        order_id = int(request.POST["order_id"])
        service = _get_service()
        service.ship_order(order_id)
        return redirect("shipping:shipment_list")
