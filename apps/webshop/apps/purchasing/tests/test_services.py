"""仕入管理アプリケーションサービスの統合テスト。"""

from datetime import date, timedelta

import pytest

from apps.inventory.models import StockLot as StockLotModel
from apps.inventory.repositories import DjangoStockLotRepository
from apps.products.models import Item, Supplier
from apps.purchasing.models import PurchaseOrder as PurchaseOrderModel
from apps.purchasing.repositories import (
    DjangoArrivalRepository,
    DjangoPurchaseOrderRepository,
)
from apps.purchasing.services import (
    PlacePurchaseOrderCommand,
    PurchasingService,
    ReceiveArrivalCommand,
)


@pytest.mark.django_db
class TestPurchasingService:
    """PurchasingService の統合テスト。"""

    def setup_method(self):
        self.supplier = Supplier.objects.create(name="テスト仕入先")
        self.item = Item.objects.create(
            name="バラ（赤）",
            quality_retention_days=7,
            purchase_unit=10,
            lead_time_days=2,
            supplier=self.supplier,
        )
        self.service = PurchasingService(
            po_repo=DjangoPurchaseOrderRepository(),
            arrival_repo=DjangoArrivalRepository(),
            stock_lot_repo=DjangoStockLotRepository(),
        )

    def test_発注を登録できる(self):
        command = PlacePurchaseOrderCommand(
            item_id=self.item.pk,
            supplier_id=self.supplier.pk,
            quantity=100,
            expected_arrival_date=date.today() + timedelta(days=3),
        )
        po = self.service.place_order(command)
        assert po.id is not None
        assert po.quantity == 100

    def test_入荷を受け入れて在庫ロットが作成される(self):
        # 発注を先に作成
        po_model = PurchaseOrderModel.objects.create(
            item=self.item,
            supplier=self.supplier,
            quantity=100,
            expected_arrival_date=date.today() + timedelta(days=3),
            status="ordered",
        )

        command = ReceiveArrivalCommand(
            purchase_order_id=po_model.pk,
            quantity=100,
            arrived_at=date.today(),
            quality_retention_days=self.item.quality_retention_days,
        )
        arrival = self.service.receive_arrival(command)
        assert arrival.id is not None
        assert arrival.quantity == 100

        # 在庫ロットが作成されていることを確認
        lots = StockLotModel.objects.filter(item=self.item)
        assert lots.count() == 1
        lot = lots.first()
        assert lot.quantity == 100
        assert lot.remaining_quantity == 100
        assert lot.status == "available"
        # 品質維持期限 = 入荷日 + 品質維持日数 - 1
        expected_expiry = date.today() + timedelta(days=6)
        assert lot.expiry_date == expected_expiry

    def test_入荷で発注ステータスが入荷済みに遷移する(self):
        po_model = PurchaseOrderModel.objects.create(
            item=self.item,
            supplier=self.supplier,
            quantity=100,
            expected_arrival_date=date.today() + timedelta(days=3),
            status="ordered",
        )

        command = ReceiveArrivalCommand(
            purchase_order_id=po_model.pk,
            quantity=100,
            arrived_at=date.today(),
            quality_retention_days=self.item.quality_retention_days,
        )
        self.service.receive_arrival(command)

        po_model.refresh_from_db()
        assert po_model.status == "arrived"

    def test_存在しない発注への入荷でエラー(self):
        command = ReceiveArrivalCommand(
            purchase_order_id=999,
            quantity=100,
            arrived_at=date.today(),
            quality_retention_days=7,
        )
        with pytest.raises(ValueError, match="発注が見つかりません"):
            self.service.receive_arrival(command)

    def test_発注済みの一覧を取得できる(self):
        PurchaseOrderModel.objects.create(
            item=self.item,
            supplier=self.supplier,
            quantity=100,
            expected_arrival_date=date.today() + timedelta(days=3),
            status="ordered",
        )
        PurchaseOrderModel.objects.create(
            item=self.item,
            supplier=self.supplier,
            quantity=50,
            expected_arrival_date=date.today() + timedelta(days=5),
            status="arrived",
        )
        results = self.service.list_ordered()
        assert len(results) == 1
        assert results[0].quantity == 100

    def test_単品IDで発注済みの一覧を取得できる(self):
        PurchaseOrderModel.objects.create(
            item=self.item,
            supplier=self.supplier,
            quantity=100,
            expected_arrival_date=date.today() + timedelta(days=3),
            status="ordered",
        )
        results = self.service.list_ordered_by_item(self.item.pk)
        assert len(results) == 1
