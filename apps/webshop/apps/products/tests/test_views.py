"""商品管理の API テスト。

DRF ViewSet のリクエスト/レスポンスをテストする。
"""

import pytest
from django.test import Client

from apps.products.models import Item, Supplier


@pytest.mark.django_db
class TestSupplierAPI:
    """仕入先 API のテスト。"""

    def setup_method(self):
        self.client = Client()
        self.supplier = Supplier.objects.create(
            name="花卉市場A", contact_info="03-1234-5678"
        )

    def test_仕入先一覧を取得できる(self):
        response = self.client.get("/api/suppliers/")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["name"] == "花卉市場A"

    def test_仕入先詳細を取得できる(self):
        response = self.client.get(f"/api/suppliers/{self.supplier.pk}/")
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "花卉市場A"
        assert data["contact_info"] == "03-1234-5678"


@pytest.mark.django_db
class TestItemAPI:
    """単品 API のテスト。"""

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
        Item.objects.create(
            name="カスミソウ",
            quality_retention_days=5,
            purchase_unit=20,
            lead_time_days=2,
            supplier=self.supplier,
            is_active=False,
        )

    def test_有効な単品一覧のみ取得できる(self):
        response = self.client.get("/api/items/")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["name"] == "バラ（赤）"

    def test_単品詳細を取得できる(self):
        response = self.client.get(f"/api/items/{self.item.pk}/")
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "バラ（赤）"
        assert data["quality_retention_days"] == 7
        assert data["purchase_unit"] == 10
        assert data["lead_time_days"] == 3
        assert data["supplier"]["name"] == "花卉市場A"

    def test_存在しない単品で404(self):
        response = self.client.get("/api/items/9999/")
        assert response.status_code == 404
