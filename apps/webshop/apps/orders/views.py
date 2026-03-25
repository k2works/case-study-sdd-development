"""注文画面の View。"""

from datetime import date, datetime
from decimal import Decimal

from django.http import Http404, HttpResponseForbidden
from django.shortcuts import get_object_or_404, redirect, render
from django.views import View

from apps.orders.domain.value_objects import OrderStatus
from apps.orders.forms import OrderForm
from apps.orders.repositories import DjangoOrderRepository
from apps.orders.services import OrderService, PlaceOrderCommand
from apps.products.models import Product

ORDER_CANCEL_TEMPLATE = "shop/order_cancel.html"


def _get_order_service() -> OrderService:
    """OrderService のファクトリ。DI コンテナの代替。"""
    return OrderService(order_repo=DjangoOrderRepository())


# --- スタッフ向け View ---


class StaffOrderListView(View):
    """受注一覧画面（スタッフ向け）。ステータス・日付でフィルタ可能。"""

    def get(self, request):
        service = _get_order_service()
        status = request.GET.get("status") or None
        date_from = _parse_date(request.GET.get("date_from"))
        date_to = _parse_date(request.GET.get("date_to"))

        orders = service.list_orders(
            status=status, date_from=date_from, date_to=date_to
        )
        return render(
            request,
            "shop/staff_order_list.html",
            {
                "orders": orders,
                "order_count": len(orders),
                "current_status": status or "",
                "date_from": request.GET.get("date_from", ""),
                "date_to": request.GET.get("date_to", ""),
                "status_choices": [("", "すべて")]
                + [(s.value, s.label) for s in OrderStatus],
            },
        )


class StaffOrderDetailView(View):
    """受注詳細画面（スタッフ向け）。"""

    def get(self, request, pk):
        service = _get_order_service()
        order = service.find_order(pk)
        if order is None:
            raise Http404
        return render(request, "shop/staff_order_detail.html", {"order": order})


# --- 得意先向け View ---


class OrderHistoryView(View):
    """注文履歴画面。注文番号の部分一致で検索可能。"""

    def get(self, request):
        query = request.GET.get("q", "").strip()
        orders = []
        if query:
            service = _get_order_service()
            orders = service.search_orders_by_number(query)
        return render(
            request,
            "shop/order_history.html",
            {"orders": orders, "query": query},
        )


class OrderHistoryDetailView(View):
    """注文詳細画面（得意先向け）。注文番号でアクセス。"""

    def get(self, request, order_number):
        service = _get_order_service()
        order = service.find_order_by_number(order_number)
        if order is None:
            raise Http404
        return render(request, "shop/order_history_detail.html", {"order": order})


class AddressSelectView(View):
    """届け先選択画面。過去の届け先一覧を表示し選択する。"""

    def get(self, request, pk):
        product = get_object_or_404(Product, pk=pk, is_active=True)
        service = _get_order_service()
        addresses = service.list_recent_addresses()
        return render(
            request,
            "shop/address_select.html",
            {"product": product, "addresses": addresses},
        )

    def post(self, request, pk):
        request.session["selected_address"] = {
            "recipient_name": request.POST.get("recipient_name", ""),
            "postal_code": request.POST.get("postal_code", ""),
            "address": request.POST.get("address", ""),
            "phone": request.POST.get("phone", ""),
        }
        return redirect("shop:order_form", pk=pk)


def _parse_date(value: str | None) -> date | None:
    """日付文字列をパースする。無効値は None を返す。"""
    if not value:
        return None
    try:
        return datetime.strptime(value, "%Y-%m-%d").date()
    except ValueError:
        return None


class OrderFormView(View):
    """注文入力画面。"""

    def get(self, request, pk):
        product = get_object_or_404(Product, pk=pk, is_active=True)
        # セッションから届け先コピーがあればプリフィル
        initial = {}
        selected = request.session.pop("selected_address", None)
        if selected:
            initial = {
                "recipient_name": selected.get("recipient_name", ""),
                "postal_code": selected.get("postal_code", ""),
                "address": selected.get("address", ""),
                "phone": selected.get("phone", ""),
            }
        form = OrderForm(initial=initial)
        return render(
            request,
            "shop/order_form.html",
            {"product": product, "form": form},
        )

    def post(self, request, pk):
        product = get_object_or_404(Product, pk=pk, is_active=True)
        form = OrderForm(request.POST)
        if not form.is_valid():
            return render(
                request,
                "shop/order_form.html",
                {"product": product, "form": form},
            )

        service = _get_order_service()
        command = PlaceOrderCommand(
            product_id=product.pk,
            product_name=product.name,
            unit_price=Decimal(str(product.price)),
            quantity=form.cleaned_data["quantity"],
            delivery_date=form.cleaned_data["delivery_date"],
            recipient_name=form.cleaned_data["recipient_name"],
            postal_code=form.cleaned_data["postal_code"],
            address=form.cleaned_data["address"],
            phone=form.cleaned_data["phone"],
            message=form.cleaned_data.get("message", ""),
        )
        saved = service.place_order(command)
        request.session["completed_order_id"] = saved.id
        return redirect("shop:order_complete", pk=saved.id)


class OrderCompleteView(View):
    """注文完了画面。セッションで直前の注文のみアクセス許可。"""

    def get(self, request, pk):
        if request.session.get("completed_order_id") != pk:
            return HttpResponseForbidden("この注文にはアクセスできません")
        service = _get_order_service()
        order = service.find_order(pk)
        if order is None:
            raise Http404
        return render(request, "shop/order_complete.html", {"order": order})


class ChangeDeliveryDateView(View):
    """届け日変更画面（US-013）。"""

    def get(self, request, order_number):
        service = _get_order_service()
        order = service.find_order_by_number(order_number)
        if order is None:
            raise Http404
        return render(
            request,
            "shop/order_change_delivery_date.html",
            {"order": order, "error": None},
        )

    def post(self, request, order_number):
        service = _get_order_service()
        order = service.find_order_by_number(order_number)
        if order is None:
            raise Http404
        new_date_str = request.POST.get("new_delivery_date", "")
        if not new_date_str:
            return render(
                request,
                "shop/order_change_delivery_date.html",
                {"order": order, "error": "届け日を入力してください"},
            )
        try:
            new_date = _parse_date(new_date_str)
            if new_date is None:
                raise ValueError("日付の形式が正しくありません")
            service.change_delivery_date(order.id, new_date)
            return redirect(
                "shop:order_history_detail",
                order_number=order_number,
            )
        except ValueError as e:
            order = service.find_order_by_number(order_number)
            return render(
                request,
                "shop/order_change_delivery_date.html",
                {"order": order, "error": str(e)},
            )


class OrderCancelView(View):
    """注文キャンセル画面。注文番号で検索しキャンセルする。"""

    def get(self, request):
        return render(request, ORDER_CANCEL_TEMPLATE, {"order": None, "error": None})

    def post(self, request):
        action = request.POST.get("action", "search")
        service = _get_order_service()

        if action == "search":
            order_number = request.POST.get("order_number", "").strip()
            if not order_number:
                return render(
                    request,
                    ORDER_CANCEL_TEMPLATE,
                    {"order": None, "error": "注文番号を入力してください"},
                )
            order = service.find_order_by_number(order_number)
            if order is None:
                return render(
                    request,
                    ORDER_CANCEL_TEMPLATE,
                    {"order": None, "error": "注文が見つかりません"},
                )
            return render(
                request,
                ORDER_CANCEL_TEMPLATE,
                {"order": order, "error": None},
            )

        if action == "cancel":
            try:
                order_id = int(request.POST.get("order_id", "0"))
            except (TypeError, ValueError):
                return render(
                    request,
                    ORDER_CANCEL_TEMPLATE,
                    {"order": None, "error": "無効な注文IDです"},
                )
            try:
                service.cancel_order(order_id)
                return render(
                    request,
                    "shop/order_cancel_complete.html",
                    {"order_id": order_id},
                )
            except ValueError as e:
                order = service.find_order(order_id)
                return render(
                    request,
                    ORDER_CANCEL_TEMPLATE,
                    {"order": order, "error": str(e)},
                )

        return render(request, ORDER_CANCEL_TEMPLATE, {"order": None, "error": None})
