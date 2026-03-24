"""商品管理の Repository 実装（インフラ層）。

domain/interfaces.py で定義された ABC を Django ORM で実装する。
"""

from __future__ import annotations

from decimal import Decimal

from apps.products.domain.entities import Composition, Item, Product, Supplier
from apps.products.domain.interfaces import (
    ItemRepository,
    ProductRepository,
    SupplierRepository,
)
from apps.products.domain.value_objects import (
    ItemName,
    LeadTimeDays,
    Price,
    ProductName,
    PurchaseUnit,
    QualityRetentionDays,
)
from apps.products.models import Composition as CompositionModel
from apps.products.models import Item as ItemModel
from apps.products.models import Product as ProductModel
from apps.products.models import Supplier as SupplierModel


class DjangoSupplierRepository(SupplierRepository):
    """仕入先 Repository の Django ORM 実装。"""

    def find_by_id(self, supplier_id: int) -> Supplier | None:
        try:
            obj = SupplierModel.objects.get(pk=supplier_id)
            return self._to_entity(obj)
        except SupplierModel.DoesNotExist:
            return None

    def save(self, supplier: Supplier) -> Supplier:
        if supplier.id is not None:
            obj = SupplierModel.objects.get(pk=supplier.id)
            obj.name = supplier.name
            obj.contact_info = supplier.contact_info
            obj.save()
        else:
            obj = SupplierModel.objects.create(
                name=supplier.name,
                contact_info=supplier.contact_info,
            )
        return self._to_entity(obj)

    def _to_entity(self, obj: SupplierModel) -> Supplier:
        return Supplier(
            id=obj.pk,
            name=obj.name,
            contact_info=obj.contact_info,
        )


class DjangoItemRepository(ItemRepository):
    """単品 Repository の Django ORM 実装。"""

    def find_by_id(self, item_id: int) -> Item | None:
        try:
            obj = ItemModel.objects.get(pk=item_id)
            return self._to_entity(obj)
        except ItemModel.DoesNotExist:
            return None

    def find_active(self) -> list[Item]:
        objs = ItemModel.objects.filter(is_active=True).order_by("name")
        return [self._to_entity(obj) for obj in objs]

    def save(self, item: Item) -> Item:
        if item.id is not None:
            obj = ItemModel.objects.get(pk=item.id)
            obj.name = str(item.name)
            obj.quality_retention_days = item.quality_retention_days.value
            obj.purchase_unit = item.purchase_unit.value
            obj.lead_time_days = item.lead_time_days.value
            obj.supplier_id = item.supplier_id
            obj.is_active = item.is_active
            obj.save()
        else:
            obj = ItemModel.objects.create(
                name=str(item.name),
                quality_retention_days=item.quality_retention_days.value,
                purchase_unit=item.purchase_unit.value,
                lead_time_days=item.lead_time_days.value,
                supplier_id=item.supplier_id,
                is_active=item.is_active,
            )
        return self._to_entity(obj)

    def _to_entity(self, obj: ItemModel) -> Item:
        return Item(
            id=obj.pk,
            name=ItemName(obj.name),
            quality_retention_days=QualityRetentionDays(obj.quality_retention_days),
            purchase_unit=PurchaseUnit(obj.purchase_unit),
            lead_time_days=LeadTimeDays(obj.lead_time_days),
            supplier_id=obj.supplier_id,
            is_active=obj.is_active,
        )


class DjangoProductRepository(ProductRepository):
    """商品 Repository の Django ORM 実装。"""

    def find_by_id(self, product_id: int) -> Product | None:
        try:
            obj = ProductModel.objects.prefetch_related("compositions").get(
                pk=product_id
            )
            return self._to_entity(obj)
        except ProductModel.DoesNotExist:
            return None

    def find_active(self) -> list[Product]:
        objs = (
            ProductModel.objects.filter(is_active=True)
            .prefetch_related("compositions")
            .order_by("name")
        )
        return [self._to_entity(obj) for obj in objs]

    def save(self, product: Product) -> Product:
        if product.id is not None:
            obj = ProductModel.objects.get(pk=product.id)
            obj.name = str(product.name)
            obj.description = product.description
            obj.price = product.price.value
            obj.image_url = product.image_url
            obj.is_active = product.is_active
            obj.save()
        else:
            obj = ProductModel.objects.create(
                name=str(product.name),
                description=product.description,
                price=product.price.value,
                image_url=product.image_url,
                is_active=product.is_active,
            )
        # Composition の同期
        CompositionModel.objects.filter(product=obj).delete()
        for comp in product.compositions:
            CompositionModel.objects.create(
                product=obj,
                item_id=comp.item_id,
                quantity=comp.quantity,
            )
        return self._to_entity(obj)

    def _to_entity(self, obj: ProductModel) -> Product:
        compositions = [
            Composition(
                product_id=obj.pk,
                item_id=c.item_id,
                quantity=c.quantity,
            )
            for c in obj.compositions.all()
        ]
        return Product(
            id=obj.pk,
            name=ProductName(obj.name),
            description=obj.description,
            price=Price(Decimal(str(obj.price))),
            image_url=obj.image_url,
            is_active=obj.is_active,
            compositions=compositions,
        )
