"""出荷管理アプリケーション設定。"""

from django.apps import AppConfig


class ShippingConfig(AppConfig):
    """出荷管理アプリ。"""

    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.shipping"
    verbose_name = "出荷管理"
