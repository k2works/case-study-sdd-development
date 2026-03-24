"""注文画面の View。"""

from decimal import Decimal

from django.http import HttpResponseForbidden
from django.shortcuts import get_object_or_404, redirect, render
from django.views import View

from apps.orders.domain.entities import DeliveryAddress, Order, OrderLine
from apps.orders.domain.value_objects import DeliveryDate, Message, OrderNumber
from apps.orders.forms import OrderForm
from apps.orders.models import Order as OrderModel
from apps.orders.repositories import DjangoOrderRepository
from apps.products.models import Product


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

        repo = DjangoOrderRepository()
        order_number = repo.next_order_number()
        order = Order(
            id=None,
            order_number=OrderNumber(order_number),
            delivery_date=DeliveryDate(form.cleaned_data["delivery_date"]),
            delivery_address=DeliveryAddress(
                recipient_name=form.cleaned_data["recipient_name"],
                postal_code=form.cleaned_data["postal_code"],
                address=form.cleaned_data["address"],
                phone=form.cleaned_data["phone"],
            ),
            message=Message(form.cleaned_data.get("message", "")),
            lines=[
                OrderLine(
                    product_id=product.pk,
                    product_name=product.name,
                    unit_price=Decimal(str(product.price)),
                    quantity=form.cleaned_data["quantity"],
                ),
            ],
        )
        order.confirm()
        saved = repo.save(order)
        request.session["completed_order_id"] = saved.id
        return redirect("shop:order_complete", pk=saved.id)


class OrderCompleteView(View):
    """注文完了画面。セッションで直前の注文のみアクセス許可。"""

    def get(self, request, pk):
        if request.session.get("completed_order_id") != pk:
            return HttpResponseForbidden("この注文にはアクセスできません")
        order = get_object_or_404(OrderModel, pk=pk)
        return render(request, "shop/order_complete.html", {"order": order})
