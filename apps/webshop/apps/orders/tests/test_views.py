"""注文画面のテスト。"""

from datetime import date, timedelta

import pytest
from django.test import Client

from apps.orders.models import Order as OrderModel
from apps.orders.models import OrderLine as OrderLineModel
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

    def _set_session_order(self, order_pk):
        session = self.client.session
        session["completed_order_id"] = order_pk
        session.save()

    def test_完了画面が表示される(self):
        self._set_session_order(self.order.pk)
        response = self.client.get(f"/shop/order/{self.order.pk}/complete/")
        assert response.status_code == 200

    def test_注文番号が表示される(self):
        self._set_session_order(self.order.pk)
        response = self.client.get(f"/shop/order/{self.order.pk}/complete/")
        assert "ORD-TEST-001" in response.content.decode()

    def test_完了画面テンプレートが使用される(self):
        self._set_session_order(self.order.pk)
        response = self.client.get(f"/shop/order/{self.order.pk}/complete/")
        assert "shop/order_complete.html" in [t.name for t in response.templates]

    def test_セッションなしでアクセスすると403(self):
        response = self.client.get(f"/shop/order/{self.order.pk}/complete/")
        assert response.status_code == 403


@pytest.mark.django_db
class TestOrderCancelView:
    """注文キャンセル画面のテスト。"""

    def setup_method(self):
        self.client = Client()
        self.product = Product.objects.create(
            name="バースデーブーケ", description="", price="5000.00"
        )
        self.order = OrderModel.objects.create(
            order_number="ORD-TEST-CANCEL",
            status="confirmed",
            recipient_name="山田太郎",
            postal_code="100-0001",
            address="東京都千代田区千代田1-1",
            phone="03-1234-5678",
            delivery_date=date.today() + timedelta(days=10),
            message="",
        )
        OrderLineModel.objects.create(
            order=self.order,
            product=self.product,
            product_name="バースデーブーケ",
            unit_price="5000.00",
            quantity=1,
        )

    def test_初期画面が表示される(self):
        response = self.client.get("/shop/order/cancel/")
        assert response.status_code == 200
        assert "注文キャンセル" in response.content.decode()

    def test_注文番号で検索できる(self):
        response = self.client.post(
            "/shop/order/cancel/",
            {"action": "search", "order_number": "ORD-TEST-CANCEL"},
        )
        assert response.status_code == 200
        assert "ORD-TEST-CANCEL" in response.content.decode()

    def test_存在しない注文番号でエラー(self):
        response = self.client.post(
            "/shop/order/cancel/",
            {"action": "search", "order_number": "ORD-NONE"},
        )
        assert response.status_code == 200
        assert "注文が見つかりません" in response.content.decode()

    def test_注文をキャンセルできる(self):
        response = self.client.post(
            "/shop/order/cancel/",
            {"action": "cancel", "order_id": str(self.order.pk)},
        )
        assert response.status_code == 200
        assert "キャンセルが完了しました" in response.content.decode()
        self.order.refresh_from_db()
        assert self.order.status == "cancelled"

    def test_キャンセル期限切れでエラー(self):
        self.order.delivery_date = date.today() + timedelta(days=2)
        self.order.save()
        response = self.client.post(
            "/shop/order/cancel/",
            {"action": "cancel", "order_id": str(self.order.pk)},
        )
        assert response.status_code == 200
        assert "キャンセル期限" in response.content.decode()
