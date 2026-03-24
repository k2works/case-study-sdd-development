"""注文画面のテスト。"""

from datetime import date, timedelta

import pytest
from django.test import Client

from apps.orders.models import Order as OrderModel
from apps.products.models import Product


@pytest.mark.django_db
class TestOrderFormView:
    """注文入力画面のテスト。"""

    def setup_method(self):
        self.client = Client()
        self.product = Product.objects.create(
            name="バースデーブーケ",
            description="お誕生日用",
            price="5000.00",
        )

    def test_注文フォームが表示される(self):
        response = self.client.get(f"/shop/{self.product.pk}/order/")
        assert response.status_code == 200

    def test_注文フォームテンプレートが使用される(self):
        response = self.client.get(f"/shop/{self.product.pk}/order/")
        assert "shop/order_form.html" in [t.name for t in response.templates]

    def test_商品名がフォームに表示される(self):
        response = self.client.get(f"/shop/{self.product.pk}/order/")
        assert "バースデーブーケ" in response.content.decode()

    def test_非アクティブ商品では404(self):
        inactive = Product.objects.create(
            name="廃止ブーケ", description="", price="3000.00", is_active=False
        )
        response = self.client.get(f"/shop/{inactive.pk}/order/")
        assert response.status_code == 404


@pytest.mark.django_db
class TestOrderSubmitView:
    """注文送信のテスト。"""

    def setup_method(self):
        self.client = Client()
        self.product = Product.objects.create(
            name="バースデーブーケ",
            description="お誕生日用",
            price="5000.00",
        )
        self.delivery_date = (date.today() + timedelta(days=3)).isoformat()

    def test_注文を送信できる(self):
        response = self.client.post(
            f"/shop/{self.product.pk}/order/",
            {
                "recipient_name": "山田太郎",
                "postal_code": "100-0001",
                "address": "東京都千代田区千代田1-1",
                "phone": "03-1234-5678",
                "delivery_date": self.delivery_date,
                "message": "お誕生日おめでとう",
                "quantity": "1",
            },
        )
        assert response.status_code == 302
        assert OrderModel.objects.count() == 1

    def test_注文後に完了画面にリダイレクトされる(self):
        response = self.client.post(
            f"/shop/{self.product.pk}/order/",
            {
                "recipient_name": "山田太郎",
                "postal_code": "100-0001",
                "address": "東京都千代田区千代田1-1",
                "phone": "03-1234-5678",
                "delivery_date": self.delivery_date,
                "message": "",
                "quantity": "1",
            },
        )
        order = OrderModel.objects.first()
        assert response.url == f"/shop/order/{order.pk}/complete/"

    def test_必須項目が空だとフォームに戻る(self):
        response = self.client.post(
            f"/shop/{self.product.pk}/order/",
            {
                "recipient_name": "",
                "postal_code": "100-0001",
                "address": "東京都千代田区千代田1-1",
                "phone": "03-1234-5678",
                "delivery_date": self.delivery_date,
                "message": "",
                "quantity": "1",
            },
        )
        assert response.status_code == 200
        assert OrderModel.objects.count() == 0


@pytest.mark.django_db
class TestOrderCompleteView:
    """注文完了画面のテスト。"""

    def setup_method(self):
        self.client = Client()
        self.product = Product.objects.create(
            name="バースデーブーケ", description="", price="5000.00"
        )
        self.order = OrderModel.objects.create(
            order_number="ORD-TEST-001",
            status="confirmed",
            recipient_name="山田太郎",
            postal_code="100-0001",
            address="東京都千代田区千代田1-1",
            phone="03-1234-5678",
            delivery_date=date.today() + timedelta(days=3),
            message="お誕生日おめでとう",
        )

    def test_完了画面が表示される(self):
        response = self.client.get(f"/shop/order/{self.order.pk}/complete/")
        assert response.status_code == 200

    def test_注文番号が表示される(self):
        response = self.client.get(f"/shop/order/{self.order.pk}/complete/")
        assert "ORD-TEST-001" in response.content.decode()

    def test_完了画面テンプレートが使用される(self):
        response = self.client.get(f"/shop/order/{self.order.pk}/complete/")
        assert "shop/order_complete.html" in [t.name for t in response.templates]
