"""在庫推移画面の統合テスト。"""

from datetime import date

import pytest
from django.test import Client

from apps.inventory.models import StockLot as StockLotModel
from apps.products.models import Item, Supplier


@pytest.mark.django_db
class TestStockForecastView:
    """在庫推移画面の View テスト。"""

    def setup_method(self):
        self.client = Client()
        self.supplier = Supplier.objects.create(name="花卉市場A")
        self.item = Item.objects.create(
            name="赤バラ",
            quality_retention_days=7,
            purchase_unit=10,
            lead_time_days=2,
            supplier=self.supplier,
        )

    def test_初期表示で単品一覧が表示される(self):
        response = self.client.get("/inventory/forecast/")
        assert response.status_code == 200
        assert "赤バラ" in response.content.decode()
        assert response.context["forecast"] is None

    def test_単品選択で在庫推移テーブルが表示される(self):
        StockLotModel.objects.create(
            item=self.item,
            quantity=100,
            remaining_quantity=80,
            arrived_at=date.today(),
            expiry_date=date(2026, 12, 31),
            status="available",
        )
        response = self.client.get(f"/inventory/forecast/?item_id={self.item.pk}")
        assert response.status_code == 200
        content = response.content.decode()
        assert "赤バラ の在庫推移" in content
        assert response.context["forecast"] is not None
        assert len(response.context["forecast"].forecasts) == 14

    def test_在庫なしの場合もエラーにならない(self):
        response = self.client.get(f"/inventory/forecast/?item_id={self.item.pk}")
        assert response.status_code == 200
        assert response.context["forecast"] is not None
        assert all(
            f.stock_remaining == 0 for f in response.context["forecast"].forecasts
        )

    def test_存在しない単品IDで404(self):
        response = self.client.get("/inventory/forecast/?item_id=9999")
        assert response.status_code == 404
