"""注文画面の View。"""

from decimal import Decimal

from django.http import HttpResponseForbidden
from django.shortcuts import get_object_or_404, redirect, render
from django.views import View

from apps.orders.forms import OrderForm
from apps.orders.models import Order as OrderModel
from apps.orders.repositories import DjangoOrderRepository
from apps.orders.services import OrderService, PlaceOrderCommand
from apps.products.models import Product


def _get_order_service() -> OrderService:
    return OrderService(order_repo=DjangoOrderRepository())


class OrderFormView(View):
    """注文入力画面。"""

    def get(self, request, pk):
        product = get_object_or_404(Product, pk=pk, is_active=True)
        form = OrderForm()
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
        order = get_object_or_404(OrderModel, pk=pk)
        return render(request, "shop/order_complete.html", {"order": order})
