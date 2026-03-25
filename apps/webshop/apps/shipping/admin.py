"""出荷管理の Django Admin 設定。"""

from django.contrib import admin

from apps.shipping.models import Shipment

admin.site.register(Shipment)
