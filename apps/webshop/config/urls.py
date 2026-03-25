"""URL configuration for フレール・メモワール WEB ショップシステム."""

from django.contrib import admin
from django.urls import include, path
from django.views.generic import RedirectView
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path("", RedirectView.as_view(url="/shop/", permanent=False)),
    path("admin/", admin.site.urls),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "api/schema/swagger-ui/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
    path("api/", include("apps.products.urls")),
    path("shop/", include("apps.products.shop_urls")),
    path("staff/orders/", include("apps.orders.staff_urls")),
    path("inventory/", include("apps.inventory.urls")),
    path("staff/purchasing/", include("apps.purchasing.urls")),
    path("staff/shipping/", include("apps.shipping.urls")),
]
