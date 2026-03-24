"""スモークテスト: Django プロジェクトが正しくセットアップされていることを確認する。"""


def test_django_settings():
    """Django の設定が読み込めることを確認する。"""
    from django.conf import settings

    assert settings.INSTALLED_APPS is not None
    assert "apps.products" in settings.INSTALLED_APPS
    assert "rest_framework" in settings.INSTALLED_APPS


def test_products_app_config():
    """products アプリの AppConfig が正しく設定されていることを確認する。"""
    from apps.products.apps import ProductsConfig

    assert ProductsConfig.name == "apps.products"
    assert ProductsConfig.verbose_name == "商品管理"
