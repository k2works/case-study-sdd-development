# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.2].define(version: 2026_03_24_101908) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "arrivals", force: :cascade do |t|
    t.bigint "purchase_order_id", null: false
    t.bigint "item_id", null: false
    t.integer "quantity", null: false
    t.datetime "arrived_at", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["item_id"], name: "index_arrivals_on_item_id"
    t.index ["purchase_order_id"], name: "index_arrivals_on_purchase_order_id", unique: true
  end

  create_table "compositions", force: :cascade do |t|
    t.bigint "product_id", null: false
    t.bigint "item_id", null: false
    t.integer "quantity", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["item_id"], name: "index_compositions_on_item_id"
    t.index ["product_id", "item_id"], name: "index_compositions_on_product_id_and_item_id", unique: true
    t.index ["product_id"], name: "index_compositions_on_product_id"
  end

  create_table "customers", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "name", null: false
    t.string "phone"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_customers_on_user_id", unique: true
  end

  create_table "delivery_addresses", force: :cascade do |t|
    t.bigint "customer_id", null: false
    t.string "recipient_name", null: false
    t.string "address", null: false
    t.string "phone", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["customer_id"], name: "index_delivery_addresses_on_customer_id"
  end

  create_table "items", force: :cascade do |t|
    t.string "name", null: false
    t.integer "quality_retention_days", null: false
    t.integer "purchase_unit", null: false
    t.integer "lead_time_days", null: false
    t.bigint "supplier_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["supplier_id"], name: "index_items_on_supplier_id"
  end

  create_table "orders", force: :cascade do |t|
    t.bigint "customer_id", null: false
    t.bigint "product_id", null: false
    t.bigint "delivery_address_id", null: false
    t.date "delivery_date", null: false
    t.text "message"
    t.integer "price", null: false
    t.string "status", default: "ordered", null: false
    t.datetime "ordered_at", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["customer_id"], name: "index_orders_on_customer_id"
    t.index ["delivery_address_id"], name: "index_orders_on_delivery_address_id"
    t.index ["delivery_date"], name: "index_orders_on_delivery_date"
    t.index ["product_id"], name: "index_orders_on_product_id"
    t.index ["status"], name: "index_orders_on_status"
  end

  create_table "products", force: :cascade do |t|
    t.string "name", null: false
    t.text "description"
    t.integer "price", null: false
    t.boolean "active", default: true, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "purchase_orders", force: :cascade do |t|
    t.bigint "item_id", null: false
    t.bigint "supplier_id", null: false
    t.integer "quantity", null: false
    t.date "desired_delivery_date", null: false
    t.string "status", default: "ordered", null: false
    t.datetime "ordered_at", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["item_id"], name: "index_purchase_orders_on_item_id"
    t.index ["status"], name: "index_purchase_orders_on_status"
    t.index ["supplier_id"], name: "index_purchase_orders_on_supplier_id"
  end

  create_table "stocks", force: :cascade do |t|
    t.bigint "item_id", null: false
    t.integer "quantity", null: false
    t.date "arrived_date", null: false
    t.date "expiry_date", null: false
    t.string "status", default: "available", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["expiry_date"], name: "index_stocks_on_expiry_date"
    t.index ["item_id", "status"], name: "index_stocks_on_item_id_and_status"
    t.index ["item_id"], name: "index_stocks_on_item_id"
  end

  create_table "suppliers", force: :cascade do |t|
    t.string "name", null: false
    t.string "phone"
    t.string "email"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "users", force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "role", default: "customer", null: false
    t.string "name"
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  add_foreign_key "arrivals", "items"
  add_foreign_key "arrivals", "purchase_orders"
  add_foreign_key "compositions", "items"
  add_foreign_key "compositions", "products"
  add_foreign_key "customers", "users"
  add_foreign_key "delivery_addresses", "customers"
  add_foreign_key "items", "suppliers"
  add_foreign_key "orders", "customers"
  add_foreign_key "orders", "delivery_addresses"
  add_foreign_key "orders", "products"
  add_foreign_key "purchase_orders", "items"
  add_foreign_key "purchase_orders", "suppliers"
  add_foreign_key "stocks", "items"
end
