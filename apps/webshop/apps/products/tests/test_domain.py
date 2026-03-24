"""商品ドメイン層のユニットテスト。

エンティティ、値オブジェクトのビジネスルールを DB 非依存でテストする。
"""

from datetime import date
from decimal import Decimal

import pytest

from apps.products.domain.entities import Composition, Item, Product, Supplier
from apps.products.domain.value_objects import (
    ItemName,
    LeadTimeDays,
    Price,
    ProductName,
    PurchaseUnit,
    QualityRetentionDays,
)


class TestItemName:
    """ItemName 値オブジェクトのテスト。"""

    def test_正常な名前で生成できる(self):
        name = ItemName("バラ（赤）")
        assert name.value == "バラ（赤）"

    def test_1文字で生成できる(self):
        name = ItemName("花")
        assert name.value == "花"

    def test_100文字で生成できる(self):
        name = ItemName("あ" * 100)
        assert name.value == "あ" * 100

    def test_空文字で生成するとエラー(self):
        with pytest.raises(ValueError):
            ItemName("")

    def test_Noneで生成するとエラー(self):
        with pytest.raises((ValueError, TypeError)):
            ItemName(None)

    def test_101文字で生成するとエラー(self):
        with pytest.raises(ValueError):
            ItemName("あ" * 101)

    def test_等価性(self):
        assert ItemName("バラ") == ItemName("バラ")

    def test_非等価性(self):
        assert ItemName("バラ") != ItemName("チューリップ")

    def test_strで文字列表現を取得できる(self):
        assert str(ItemName("バラ")) == "バラ"


class TestQualityRetentionDays:
    """品質維持日数の値オブジェクトテスト。"""

    def test_正常な日数で生成できる(self):
        days = QualityRetentionDays(7)
        assert days.value == 7

    def test_1日で生成できる(self):
        days = QualityRetentionDays(1)
        assert days.value == 1

    def test_0日で生成するとエラー(self):
        with pytest.raises(ValueError):
            QualityRetentionDays(0)

    def test_負数で生成するとエラー(self):
        with pytest.raises(ValueError):
            QualityRetentionDays(-1)

    def test_品質維持期限を計算できる(self):
        days = QualityRetentionDays(7)
        arrived = date(2026, 4, 1)
        # 入荷日 + 品質維持日数 - 1
        assert days.calculate_expiry(arrived) == date(2026, 4, 7)

    def test_品質維持期限間近を判定できる(self):
        days = QualityRetentionDays(7)
        arrived = date(2026, 4, 1)
        # 期限日 = 4/7、残り 2 日以内 = 4/5(残2日), 4/6(残1日), 4/7(残0日)
        assert days.is_near_expiry(arrived, date(2026, 4, 5)) is True
        assert days.is_near_expiry(arrived, date(2026, 4, 4)) is False

    def test_品質維持期限当日は期限間近と判定される(self):
        days = QualityRetentionDays(7)
        arrived = date(2026, 4, 1)
        assert days.is_near_expiry(arrived, date(2026, 4, 7)) is True

    def test_品質維持期限超過は期限間近ではない(self):
        days = QualityRetentionDays(7)
        arrived = date(2026, 4, 1)
        assert days.is_near_expiry(arrived, date(2026, 4, 8)) is False


class TestPurchaseUnit:
    """購入単位の値オブジェクトテスト。"""

    def test_正常な単位で生成できる(self):
        unit = PurchaseUnit(10)
        assert unit.value == 10

    def test_1本で生成できる(self):
        unit = PurchaseUnit(1)
        assert unit.value == 1

    def test_0で生成するとエラー(self):
        with pytest.raises(ValueError):
            PurchaseUnit(0)

    def test_負数で生成するとエラー(self):
        with pytest.raises(ValueError):
            PurchaseUnit(-5)


class TestLeadTimeDays:
    """リードタイムの値オブジェクトテスト。"""

    def test_正常な日数で生成できる(self):
        lead = LeadTimeDays(3)
        assert lead.value == 3

    def test_0日で生成できる(self):
        lead = LeadTimeDays(0)
        assert lead.value == 0

    def test_負数で生成するとエラー(self):
        with pytest.raises(ValueError):
            LeadTimeDays(-1)

    def test_最短届け日を計算できる(self):
        lead = LeadTimeDays(3)
        order_date = date(2026, 4, 1)
        # 注文日 + リードタイム = 最短届け日
        assert lead.earliest_delivery_date(order_date) == date(2026, 4, 4)


class TestSupplier:
    """Supplier エンティティのテスト。"""

    def test_仕入先を生成できる(self):
        supplier = Supplier(id=1, name="花卉市場A", contact_info="03-1234-5678")
        assert supplier.id == 1
        assert supplier.name == "花卉市場A"
        assert supplier.contact_info == "03-1234-5678"

    def test_連絡先なしで生成できる(self):
        supplier = Supplier(id=2, name="花卉市場B")
        assert supplier.contact_info == ""

    def test_名前が空で生成するとエラー(self):
        with pytest.raises(ValueError):
            Supplier(id=1, name="")

    def test_名前が101文字で生成するとエラー(self):
        with pytest.raises(ValueError):
            Supplier(id=1, name="あ" * 101)


class TestItem:
    """Item エンティティのテスト。"""

    def test_単品を生成できる(self):
        item = Item(
            id=1,
            name=ItemName("バラ（赤）"),
            quality_retention_days=QualityRetentionDays(7),
            purchase_unit=PurchaseUnit(10),
            lead_time_days=LeadTimeDays(3),
            supplier_id=1,
        )
        assert item.id == 1
        assert item.name == ItemName("バラ（赤）")
        assert item.supplier_id == 1
        assert item.is_active is True

    def test_品質維持期限を計算できる(self):
        item = Item(
            id=1,
            name=ItemName("バラ（赤）"),
            quality_retention_days=QualityRetentionDays(7),
            purchase_unit=PurchaseUnit(10),
            lead_time_days=LeadTimeDays(3),
            supplier_id=1,
        )
        arrived = date(2026, 4, 1)
        assert item.calculate_expiry_date(arrived) == date(2026, 4, 7)

    def test_無効化できる(self):
        item = Item(
            id=1,
            name=ItemName("バラ（赤）"),
            quality_retention_days=QualityRetentionDays(7),
            purchase_unit=PurchaseUnit(10),
            lead_time_days=LeadTimeDays(3),
            supplier_id=1,
        )
        item.deactivate()
        assert item.is_active is False


class TestProductName:
    """ProductName 値オブジェクトのテスト。"""

    def test_正常な名前で生成できる(self):
        name = ProductName("バースデーブーケ")
        assert name.value == "バースデーブーケ"

    def test_1文字で生成できる(self):
        assert ProductName("花").value == "花"

    def test_100文字で生成できる(self):
        assert ProductName("あ" * 100).value == "あ" * 100

    def test_空文字で生成するとエラー(self):
        with pytest.raises(ValueError):
            ProductName("")

    def test_101文字で生成するとエラー(self):
        with pytest.raises(ValueError):
            ProductName("あ" * 101)

    def test_等価性(self):
        assert ProductName("ブーケ") == ProductName("ブーケ")


class TestPrice:
    """Price 値オブジェクトのテスト。"""

    def test_正常な価格で生成できる(self):
        price = Price(Decimal("5000"))
        assert price.value == Decimal("5000")

    def test_0円で生成できる(self):
        assert Price(Decimal("0")).value == Decimal("0")

    def test_負数で生成するとエラー(self):
        with pytest.raises(ValueError):
            Price(Decimal("-1"))

    def test_等価性(self):
        assert Price(Decimal("3000")) == Price(Decimal("3000"))

    def test_strで文字列表現を取得できる(self):
        assert str(Price(Decimal("5000"))) == "5000"


class TestProduct:
    """Product エンティティのテスト。"""

    def test_商品を生成できる(self):
        product = Product(
            id=1,
            name=ProductName("バースデーブーケ"),
            description="お誕生日用の花束",
            price=Price(Decimal("5000")),
        )
        assert product.id == 1
        assert product.name == ProductName("バースデーブーケ")
        assert product.price == Price(Decimal("5000"))
        assert product.is_active is True
        assert product.image_url == ""

    def test_無効化できる(self):
        product = Product(
            id=1,
            name=ProductName("バースデーブーケ"),
            description="",
            price=Price(Decimal("5000")),
        )
        product.deactivate()
        assert product.is_active is False

    def test_構成を追加できる(self):
        product = Product(
            id=1,
            name=ProductName("バースデーブーケ"),
            description="",
            price=Price(Decimal("5000")),
        )
        product.add_composition(item_id=1, quantity=5)
        product.add_composition(item_id=2, quantity=3)
        assert len(product.compositions) == 2

    def test_同じ単品を重複して追加するとエラー(self):
        product = Product(
            id=1,
            name=ProductName("バースデーブーケ"),
            description="",
            price=Price(Decimal("5000")),
        )
        product.add_composition(item_id=1, quantity=5)
        with pytest.raises(ValueError):
            product.add_composition(item_id=1, quantity=3)

    def test_構成を削除できる(self):
        product = Product(
            id=1,
            name=ProductName("バースデーブーケ"),
            description="",
            price=Price(Decimal("5000")),
        )
        product.add_composition(item_id=1, quantity=5)
        product.add_composition(item_id=2, quantity=3)
        product.remove_composition(item_id=1)
        assert len(product.compositions) == 1

    def test_存在しない単品を構成から削除しても例外にならない(self):
        product = Product(
            id=1,
            name=ProductName("バースデーブーケ"),
            description="",
            price=Price(Decimal("5000")),
        )
        product.add_composition(item_id=1, quantity=5)
        product.remove_composition(item_id=999)
        assert len(product.compositions) == 1

    def test_必要な単品数量を取得できる(self):
        product = Product(
            id=1,
            name=ProductName("バースデーブーケ"),
            description="",
            price=Price(Decimal("5000")),
        )
        product.add_composition(item_id=1, quantity=5)
        product.add_composition(item_id=2, quantity=3)
        required = product.get_required_items()
        assert required == {1: 5, 2: 3}


class TestComposition:
    """Composition エンティティのテスト。"""

    def test_構成を生成できる(self):
        comp = Composition(product_id=1, item_id=2, quantity=5)
        assert comp.product_id == 1
        assert comp.item_id == 2
        assert comp.quantity == 5

    def test_数量1で生成できる(self):
        comp = Composition(product_id=1, item_id=2, quantity=1)
        assert comp.quantity == 1

    def test_数量が0でエラー(self):
        with pytest.raises(ValueError):
            Composition(product_id=1, item_id=2, quantity=0)

    def test_数量が負数でエラー(self):
        with pytest.raises(ValueError):
            Composition(product_id=1, item_id=2, quantity=-1)
