-- CreateTable
CREATE TABLE "suppliers" (
    "supplier_id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("supplier_id")
);

-- CreateTable
CREATE TABLE "items" (
    "item_id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "quality_retention_days" INTEGER NOT NULL,
    "purchase_unit" INTEGER NOT NULL,
    "lead_time_days" INTEGER NOT NULL,
    "supplier_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "items_pkey" PRIMARY KEY ("item_id")
);

-- CreateTable
CREATE TABLE "products" (
    "product_id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "price" INTEGER NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("product_id")
);

-- CreateTable
CREATE TABLE "product_compositions" (
    "product_id" INTEGER NOT NULL,
    "item_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "product_compositions_pkey" PRIMARY KEY ("product_id","item_id")
);

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("supplier_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_compositions" ADD CONSTRAINT "product_compositions_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("product_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_compositions" ADD CONSTRAINT "product_compositions_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("item_id") ON DELETE RESTRICT ON UPDATE CASCADE;
