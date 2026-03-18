-- CreateTable
CREATE TABLE "arrivals" (
    "arrival_id" SERIAL NOT NULL,
    "item_id" INTEGER NOT NULL,
    "purchase_order_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "arrival_date" DATE NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "arrivals_pkey" PRIMARY KEY ("arrival_id")
);

-- AddForeignKey
ALTER TABLE "arrivals" ADD CONSTRAINT "arrivals_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("item_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "arrivals" ADD CONSTRAINT "arrivals_purchase_order_id_fkey" FOREIGN KEY ("purchase_order_id") REFERENCES "purchase_orders"("purchase_order_id") ON DELETE RESTRICT ON UPDATE CASCADE;
