"""仕入管理アプリケーション設定。"""

from django.apps import AppConfig


class PurchasingConfig(AppConfig):
    """仕入管理アプリ。"""

    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.purchasing"
    verbose_name = "仕入管理"
