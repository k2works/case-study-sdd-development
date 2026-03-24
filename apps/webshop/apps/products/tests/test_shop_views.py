"""商品閲覧画面（顧客向け）のテスト。

Django Template ベースの画面表示をテストする。
"""

import pytest
from django.test import Client

from apps.products.models import Composition, Item, Product, Supplier


@pytest.mark.django_db
class TestProductListView:
    """商品一覧画面のテスト。"""

    def setup_method(self):
        self.client = Client()
        self.product = Product.objects.create(
            name="バースデーブーケ",
            description="お誕生日用の花束",
            price="5000.00",
            image_url="https://example.com/birthday.jpg",
        )
        Product.objects.create(
            name="廃止ブーケ",
            description="",
            price="3000.00",
            is_active=False,
        )

    def test_商品一覧が表示される(self):
        response = self.client.get("/shop/")
        assert response.status_code == 200

    def test_有効な商品のみ表示される(self):
        response = self.client.get("/shop/")
        assert "バースデーブーケ" in response.content.decode()
        assert "廃止ブーケ" not in response.content.decode()

    def test_商品一覧テンプレートが使用される(self):
        response = self.client.get("/shop/")
        assert "shop/product_list.html" in [t.name for t in response.templates]

    def test_商品が0件でも正常に表示される(self):
        Product.objects.all().delete()
        response = self.client.get("/shop/")
        assert response.status_code == 200

    def test_商品の価格が表示される(self):
        response = self.client.get("/shop/")
        assert "5,000" in response.content.decode()


@pytest.mark.django_db
class TestProductDetailView:
    """商品詳細画面のテスト。"""

    def setup_method(self):
        self.client = Client()
        self.supplier = Supplier.objects.create(name="花卉市場A")
        self.item = Item.objects.create(
            name="バラ（赤）",
            quality_retention_days=7,
            purchase_unit=10,
            lead_time_days=3,
            supplier=self.supplier,
        )
        self.product = Product.objects.create(
            name="バースデーブーケ",
            description="お誕生日用の花束",
            price="5000.00",
        )
        Composition.objects.create(product=self.product, item=self.item, quantity=5)

    def test_商品詳細が表示される(self):
        response = self.client.get(f"/shop/{self.product.pk}/")
        assert response.status_code == 200

    def test_商品詳細テンプレートが使用される(self):
        response = self.client.get(f"/shop/{self.product.pk}/")
        assert "shop/product_detail.html" in [t.name for t in response.templates]

    def test_商品名と説明が表示される(self):
        response = self.client.get(f"/shop/{self.product.pk}/")
        content = response.content.decode()
        assert "バースデーブーケ" in content
        assert "お誕生日用の花束" in content

    def test_構成花材が表示される(self):
        response = self.client.get(f"/shop/{self.product.pk}/")
        content = response.content.decode()
        assert "バラ（赤）" in content

    def test_存在しない商品で404(self):
        response = self.client.get("/shop/9999/")
        assert response.status_code == 404

    def test_非アクティブ商品で404(self):
        inactive = Product.objects.create(
            name="廃止ブーケ",
            description="",
            price="3000.00",
            is_active=False,
        )
        response = self.client.get(f"/shop/{inactive.pk}/")
        assert response.status_code == 404
