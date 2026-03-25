"""仕入管理の Django Admin 設定。"""

from django.contrib import admin

from apps.purchasing.models import Arrival, PurchaseOrder

admin.site.register(PurchaseOrder)
admin.site.register(Arrival)
