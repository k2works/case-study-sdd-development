"""シードデータを作成する管理コマンド。"""

import os
import secrets
from datetime import date, timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from apps.inventory.models import StockLot
from apps.products.models import Composition, Item, Product, Supplier

ADMIN_USERNAME = "admin"
SEED_ADMIN_PASSWORD_ENV = "SEED_ADMIN_PASSWORD"


class Command(BaseCommand):
    help = "開発用シードデータを作成する"

    @staticmethod
    def _resolve_admin_password() -> tuple[str, bool]:
        value = os.getenv(SEED_ADMIN_PASSWORD_ENV, "").strip()
        if value:
            return value, False
        return secrets.token_urlsafe(24), True

    def handle(self, *args, **options):
        if Supplier.objects.exists():
            self.stdout.write(
                self.style.WARNING("シードデータは既に存在します。スキップします。")
            )
            return

        self.stdout.write("シードデータを作成中...")

        # ── 管理ユーザー ──
        user_model = get_user_model()
        if not user_model.objects.filter(username=ADMIN_USERNAME).exists():
            admin_password, generated = self._resolve_admin_password()
            user_model.objects.create_superuser(
                username=ADMIN_USERNAME,
                email="admin@example.com",
                password=admin_password,
            )
            if generated:
                self.stdout.write(
                    self.style.WARNING(
                        f"管理ユーザー作成: {ADMIN_USERNAME} / "
                        f"{SEED_ADMIN_PASSWORD_ENV} 未設定のため "
                        "ランダムパスワードを生成しました。"
                    )
                )
            else:
                self.stdout.write(f"管理ユーザー作成: {ADMIN_USERNAME}")

        # ── 仕入先 ──
        supplier_a = Supplier.objects.create(
            name="花卉卸 山田商店",
            contact_info="TEL: 03-1234-5678\nEmail: yamada@example.com",
        )
        supplier_b = Supplier.objects.create(
            name="フラワーマーケット鈴木",
            contact_info="TEL: 06-9876-5432\nEmail: suzuki@example.com",
        )
        supplier_c = Supplier.objects.create(
            name="グリーンファーム佐藤",
            contact_info="TEL: 052-111-2222\nEmail: sato@example.com",
        )

        # ── 単品（花材） ──
        rose_red = Item.objects.create(
            name="赤バラ",
            quality_retention_days=7,
            purchase_unit=10,
            lead_time_days=2,
            supplier=supplier_a,
        )
        rose_pink = Item.objects.create(
            name="ピンクバラ",
            quality_retention_days=7,
            purchase_unit=10,
            lead_time_days=2,
            supplier=supplier_a,
        )
        rose_white = Item.objects.create(
            name="白バラ",
            quality_retention_days=7,
            purchase_unit=10,
            lead_time_days=2,
            supplier=supplier_a,
        )
        carnation = Item.objects.create(
            name="カーネーション",
            quality_retention_days=10,
            purchase_unit=20,
            lead_time_days=1,
            supplier=supplier_b,
        )
        lily = Item.objects.create(
            name="ユリ",
            quality_retention_days=5,
            purchase_unit=5,
            lead_time_days=3,
            supplier=supplier_b,
        )
        gerbera = Item.objects.create(
            name="ガーベラ",
            quality_retention_days=6,
            purchase_unit=10,
            lead_time_days=1,
            supplier=supplier_c,
        )
        baby_breath = Item.objects.create(
            name="カスミソウ",
            quality_retention_days=14,
            purchase_unit=20,
            lead_time_days=1,
            supplier=supplier_c,
        )
        eucalyptus = Item.objects.create(
            name="ユーカリ",
            quality_retention_days=14,
            purchase_unit=10,
            lead_time_days=2,
            supplier=supplier_c,
        )

        # ── 商品（花束） ──
        bouquet_red = Product.objects.create(
            name="ロマンティックレッド",
            description="情熱的な赤バラをメインにした豪華な花束。記念日やプロポーズに最適です。",
            price=Decimal("5500.00"),
        )
        Composition.objects.create(product=bouquet_red, item=rose_red, quantity=5)
        Composition.objects.create(product=bouquet_red, item=baby_breath, quantity=3)
        Composition.objects.create(product=bouquet_red, item=eucalyptus, quantity=2)

        bouquet_pastel = Product.objects.create(
            name="パステルブーケ",
            description="ピンクバラとカーネーションの優しい色合いの花束。お誕生日やお見舞いにどうぞ。",
            price=Decimal("3800.00"),
        )
        Composition.objects.create(product=bouquet_pastel, item=rose_pink, quantity=3)
        Composition.objects.create(product=bouquet_pastel, item=carnation, quantity=4)
        Composition.objects.create(product=bouquet_pastel, item=baby_breath, quantity=2)

        bouquet_white = Product.objects.create(
            name="ホワイトエレガンス",
            description="白バラとユリで仕立てた清楚で上品な花束。冠婚葬祭やフォーマルな場面に。",
            price=Decimal("7000.00"),
        )
        Composition.objects.create(product=bouquet_white, item=rose_white, quantity=3)
        Composition.objects.create(product=bouquet_white, item=lily, quantity=2)
        Composition.objects.create(product=bouquet_white, item=eucalyptus, quantity=3)

        bouquet_cheerful = Product.objects.create(
            name="チアフルミックス",
            description="ガーベラとカーネーションの明るい色合い。元気を届けたいときにぴったりです。",
            price=Decimal("3200.00"),
        )
        Composition.objects.create(product=bouquet_cheerful, item=gerbera, quantity=4)
        Composition.objects.create(product=bouquet_cheerful, item=carnation, quantity=3)
        Composition.objects.create(
            product=bouquet_cheerful, item=baby_breath, quantity=2
        )

        bouquet_seasonal = Product.objects.create(
            name="季節のおまかせ花束",
            description="旬の花材を使ったおまかせ花束。スタッフが心を込めてお作りします。",
            price=Decimal("4500.00"),
            is_active=False,
        )
        Composition.objects.create(product=bouquet_seasonal, item=rose_pink, quantity=2)
        Composition.objects.create(product=bouquet_seasonal, item=gerbera, quantity=2)
        Composition.objects.create(product=bouquet_seasonal, item=lily, quantity=1)

        # ── 在庫ロット ──
        today = date.today()

        stock_data = [
            (rose_red, 20, 18, today - timedelta(days=2), 7),
            (rose_red, 10, 10, today, 7),
            (rose_pink, 20, 15, today - timedelta(days=1), 7),
            (rose_white, 10, 8, today - timedelta(days=3), 7),
            (carnation, 40, 30, today - timedelta(days=2), 10),
            (lily, 10, 7, today - timedelta(days=1), 5),
            (gerbera, 20, 16, today, 6),
            (baby_breath, 40, 35, today - timedelta(days=3), 14),
            (eucalyptus, 20, 18, today - timedelta(days=4), 14),
            # 期限間近
            (rose_red, 10, 3, today - timedelta(days=6), 7),
        ]

        for item, qty, remaining, arrived, retention in stock_data:
            expiry = arrived + timedelta(days=retention - 1)
            remaining_days = (expiry - today).days
            if remaining_days < 0:
                status = "expired"
            elif remaining_days <= 2:
                status = "near_expiry"
            elif remaining == 0:
                status = "depleted"
            else:
                status = "available"

            StockLot.objects.create(
                item=item,
                quantity=qty,
                remaining_quantity=remaining,
                arrived_at=arrived,
                expiry_date=expiry,
                status=status,
            )

        self.stdout.write(
            self.style.SUCCESS(
                f"シードデータ作成完了: "
                f"仕入先 {Supplier.objects.count()}件, "
                f"単品 {Item.objects.count()}件, "
                f"商品 {Product.objects.count()}件, "
                f"在庫ロット {StockLot.objects.count()}件"
            )
        )
