"""顧客向け商品閲覧画面の View。"""

from django.views.generic import DetailView, ListView

from apps.products.models import Product


class ProductListView(ListView):
    """商品一覧画面。有効な商品のみカード形式で表示。"""

    model = Product
    template_name = "shop/product_list.html"
    context_object_name = "products"

    def get_queryset(self):
        return Product.objects.filter(is_active=True).order_by("name")


class ProductDetailView(DetailView):
    """商品詳細画面。構成花材・価格・説明を表示。"""

    model = Product
    template_name = "shop/product_detail.html"
    context_object_name = "product"

    def get_queryset(self):
        return Product.objects.filter(is_active=True).prefetch_related(
            "compositions__item__supplier"
        )
