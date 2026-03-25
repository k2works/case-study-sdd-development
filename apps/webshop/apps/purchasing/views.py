"""仕入管理画面の View。"""

from datetime import date

from django.shortcuts import get_object_or_404, redirect, render
from django.views import View

from apps.inventory.repositories import DjangoStockLotRepository
from apps.products.models import Item
from apps.purchasing.repositories import (
    DjangoArrivalRepository,
    DjangoPurchaseOrderRepository,
)
from apps.purchasing.services import (
    PlacePurchaseOrderCommand,
    PurchasingService,
    ReceiveArrivalCommand,
)


def _get_service() -> PurchasingService:
    return PurchasingService(
        po_repo=DjangoPurchaseOrderRepository(),
        arrival_repo=DjangoArrivalRepository(),
        stock_lot_repo=DjangoStockLotRepository(),
    )


def _enrich_orders(orders):
    """発注エンティティに単品名・仕入先名を付与する。"""
    from apps.products.models import Supplier

    item_ids = {o.item_id for o in orders}
    supplier_ids = {o.supplier_id for o in orders}
    items = {i.pk: i.name for i in Item.objects.filter(pk__in=item_ids)}
    suppliers = {s.pk: s.name for s in Supplier.objects.filter(pk__in=supplier_ids)}

    enriched = []
    for o in orders:
        o.item_name = items.get(o.item_id, "")
        o.supplier_name = suppliers.get(o.supplier_id, "")
        enriched.append(o)
    return enriched


class PurchaseOrderListView(View):
    """発注一覧画面。"""

    def get(self, request):
        service = _get_service()
        orders = _enrich_orders(service.list_ordered())
        return render(
            request,
            "staff/purchase_order_list.html",
            {"orders": orders, "order_count": len(orders)},
        )


class PurchaseOrderCreateView(View):
    """発注登録画面。"""

    def get(self, request):
        items = Item.objects.filter(is_active=True).order_by("name")
        selected_item_id = request.GET.get("item_id")
        selected_item = None
        if selected_item_id:
            selected_item = Item.objects.filter(
                pk=selected_item_id, is_active=True
            ).first()
        return render(
            request,
            "staff/purchase_order_form.html",
            {"items": items, "selected_item": selected_item},
        )

    def post(self, request):
        item = get_object_or_404(Item, pk=request.POST["item_id"])
        command = PlacePurchaseOrderCommand(
            item_id=item.pk,
            supplier_id=item.supplier_id,
            quantity=int(request.POST["quantity"]),
            expected_arrival_date=date.fromisoformat(
                request.POST["expected_arrival_date"]
            ),
        )
        service = _get_service()
        service.place_order(command)
        return redirect("purchasing:order_list")


class ArrivalCreateView(View):
    """入荷登録画面。"""

    def get(self, request):
        service = _get_service()
        orders = _enrich_orders(service.list_ordered())
        selected_po_id = request.GET.get("po_id")
        selected_po = None
        if selected_po_id:
            po = service.find_purchase_order(int(selected_po_id))
            if po:
                selected_po = _enrich_orders([po])[0]
        return render(
            request,
            "staff/arrival_form.html",
            {"orders": orders, "selected_po": selected_po},
        )

    def post(self, request):
        service = _get_service()
        po = service.find_purchase_order(int(request.POST["purchase_order_id"]))
        if po is None:
            return redirect("purchasing:arrival_create")

        item = get_object_or_404(Item, pk=po.item_id)
        command = ReceiveArrivalCommand(
            purchase_order_id=po.id,
            quantity=int(request.POST["quantity"]),
            arrived_at=date.fromisoformat(
                request.POST.get("arrived_at", str(date.today()))
            ),
            quality_retention_days=item.quality_retention_days,
        )
        service.receive_arrival(command)
        return redirect("purchasing:order_list")


class ExpiryAlertView(View):
    """品質維持期限アラート画面。"""

    def get(self, request):
        stock_lot_repo = DjangoStockLotRepository()
        all_items = Item.objects.filter(is_active=True).order_by("name")

        near_expiry_lots = []
        for item in all_items:
            lots = stock_lot_repo.find_active_by_item_id(item.pk, as_of=date.today())
            for lot in lots:
                if lot.is_near_expiry(date.today()):
                    near_expiry_lots.append(
                        {
                            "item_name": item.name,
                            "lot_id": lot.id,
                            "remaining_quantity": lot.remaining_quantity,
                            "expiry_date": lot.expiry_date.value,
                            "days_remaining": lot.expiry_date.days_remaining(
                                date.today()
                            ),
                        }
                    )

        return render(
            request,
            "staff/expiry_alert.html",
            {
                "lots": near_expiry_lots,
                "lot_count": len(near_expiry_lots),
            },
        )
