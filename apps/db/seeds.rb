# frozen_string_literal: true

puts "=== シードデータの投入 ==="

# --------------------------------------------------
# 1. デフォルトスタッフユーザー
# --------------------------------------------------
staff_user = User.find_or_create_by!(email: "staff@example.com") do |user|
  user.password = "password123"
  user.password_confirmation = "password123"
  user.name = "スタッフ"
  user.role = "staff"
end
puts "スタッフユーザー: staff@example.com / password123"

# --------------------------------------------------
# 2. サンプル顧客ユーザー
# --------------------------------------------------
customer_users = [
  { email: "tanaka@example.com", name: "田中太郎", phone: "090-1234-5678" },
  { email: "suzuki@example.com", name: "鈴木花子", phone: "080-2345-6789" },
  { email: "sato@example.com",   name: "佐藤一郎", phone: "070-3456-7890" }
].map do |attrs|
  user = User.find_or_create_by!(email: attrs[:email]) do |u|
    u.password = "password123"
    u.password_confirmation = "password123"
    u.name = attrs[:name]
    u.role = "customer"
  end
  customer = Customer.find_or_create_by!(user: user) do |c|
    c.name = attrs[:name]
    c.phone = attrs[:phone]
  end
  puts "顧客: #{attrs[:email]} / password123（#{attrs[:name]}）"
  { user: user, customer: customer }
end

# --------------------------------------------------
# 3. 配送先住所
# --------------------------------------------------
delivery_addresses = []

addresses_data = [
  { customer_idx: 0, recipient_name: "田中太郎",   address: "東京都渋谷区神宮前1-1-1",   phone: "03-1111-2222" },
  { customer_idx: 0, recipient_name: "田中美咲",   address: "神奈川県横浜市中区本町3-3-3", phone: "045-333-4444" },
  { customer_idx: 1, recipient_name: "鈴木花子",   address: "大阪府大阪市北区梅田2-2-2",   phone: "06-5555-6666" },
  { customer_idx: 2, recipient_name: "佐藤一郎",   address: "愛知県名古屋市中区栄4-4-4",   phone: "052-7777-8888" }
]

addresses_data.each do |attrs|
  customer = customer_users[attrs[:customer_idx]][:customer]
  da = DeliveryAddress.find_or_create_by!(
    customer: customer,
    recipient_name: attrs[:recipient_name],
    address: attrs[:address]
  ) do |d|
    d.phone = attrs[:phone]
  end
  delivery_addresses << da
end
puts "配送先住所: #{delivery_addresses.size} 件作成"

# --------------------------------------------------
# 4. 仕入先
# --------------------------------------------------
suppliers_data = [
  { name: "花市場東京",     phone: "03-1234-5678", email: "tokyo@hanaichiba.example.com" },
  { name: "グリーンファーム", phone: "042-234-5678", email: "info@greenfarm.example.com" },
  { name: "フラワーネット",   phone: "06-345-6789",  email: "order@flowernet.example.com" }
]

suppliers = suppliers_data.map do |attrs|
  Supplier.find_or_create_by!(name: attrs[:name]) do |s|
    s.phone = attrs[:phone]
    s.email = attrs[:email]
  end
end
puts "仕入先: #{suppliers.size} 件作成"

# --------------------------------------------------
# 5. 素材（アイテム）
# --------------------------------------------------
items_data = [
  { name: "バラ（赤）",       quality_retention_days: 5,  purchase_unit: 10, lead_time_days: 3, supplier_idx: 0 },
  { name: "バラ（ピンク）",    quality_retention_days: 5,  purchase_unit: 10, lead_time_days: 3, supplier_idx: 0 },
  { name: "カスミソウ",       quality_retention_days: 7,  purchase_unit: 20, lead_time_days: 2, supplier_idx: 0 },
  { name: "ユリ（白）",       quality_retention_days: 6,  purchase_unit: 5,  lead_time_days: 4, supplier_idx: 1 },
  { name: "ガーベラ（オレンジ）", quality_retention_days: 5, purchase_unit: 10, lead_time_days: 3, supplier_idx: 1 },
  { name: "チューリップ（黄）",  quality_retention_days: 4, purchase_unit: 10, lead_time_days: 2, supplier_idx: 2 },
  { name: "ラッピングペーパー",  quality_retention_days: 365, purchase_unit: 50, lead_time_days: 5, supplier_idx: 2 },
  { name: "リボン（赤）",      quality_retention_days: 365, purchase_unit: 100, lead_time_days: 5, supplier_idx: 2 }
]

items = items_data.map do |attrs|
  Item.find_or_create_by!(name: attrs[:name]) do |i|
    i.quality_retention_days = attrs[:quality_retention_days]
    i.purchase_unit          = attrs[:purchase_unit]
    i.lead_time_days         = attrs[:lead_time_days]
    i.supplier               = suppliers[attrs[:supplier_idx]]
  end
end
puts "素材: #{items.size} 件作成"

# --------------------------------------------------
# 6. 商品
# --------------------------------------------------
products_data = [
  { name: "春のガーデンブーケ",     price: 5500,  description: "春の花々を集めた華やかなブーケ。バラとカスミソウの組み合わせが人気です。" },
  { name: "プレミアムローズアレンジ", price: 8800,  description: "上質な赤バラを贅沢に使ったアレンジメント。記念日やプロポーズに。" },
  { name: "ユリのホワイトブーケ",    price: 6600,  description: "純白のユリをメインにした上品なブーケ。冠婚葬祭にも最適です。" },
  { name: "カジュアルミックスブーケ", price: 3300,  description: "ガーベラとチューリップの明るいブーケ。日常のちょっとした贈り物に。" },
  { name: "季節のおまかせアレンジ",   price: 4400,  description: "旬の花材を使ったおまかせアレンジメント。季節感あふれる一品。" }
]

products = products_data.map do |attrs|
  Product.find_or_create_by!(name: attrs[:name]) do |p|
    p.price       = attrs[:price]
    p.description = attrs[:description]
    p.active      = true
  end
end
puts "商品: #{products.size} 件作成"

# --------------------------------------------------
# 7. 商品構成（コンポジション）
# --------------------------------------------------
compositions_data = [
  # 春のガーデンブーケ: バラ（赤）×3, カスミソウ×5, ラッピングペーパー×1, リボン（赤）×1
  { product_idx: 0, item_idx: 0, quantity: 3 },
  { product_idx: 0, item_idx: 2, quantity: 5 },
  { product_idx: 0, item_idx: 6, quantity: 1 },
  { product_idx: 0, item_idx: 7, quantity: 1 },
  # プレミアムローズアレンジ: バラ（赤）×10, バラ（ピンク）×5, ラッピングペーパー×1, リボン（赤）×2
  { product_idx: 1, item_idx: 0, quantity: 10 },
  { product_idx: 1, item_idx: 1, quantity: 5 },
  { product_idx: 1, item_idx: 6, quantity: 1 },
  { product_idx: 1, item_idx: 7, quantity: 2 },
  # ユリのホワイトブーケ: ユリ（白）×5, カスミソウ×3, ラッピングペーパー×1
  { product_idx: 2, item_idx: 3, quantity: 5 },
  { product_idx: 2, item_idx: 2, quantity: 3 },
  { product_idx: 2, item_idx: 6, quantity: 1 },
  # カジュアルミックスブーケ: ガーベラ（オレンジ）×3, チューリップ（黄）×3, ラッピングペーパー×1
  { product_idx: 3, item_idx: 4, quantity: 3 },
  { product_idx: 3, item_idx: 5, quantity: 3 },
  { product_idx: 3, item_idx: 6, quantity: 1 },
  # 季節のおまかせアレンジ: バラ（ピンク）×3, ガーベラ（オレンジ）×2, カスミソウ×3, リボン（赤）×1
  { product_idx: 4, item_idx: 1, quantity: 3 },
  { product_idx: 4, item_idx: 4, quantity: 2 },
  { product_idx: 4, item_idx: 2, quantity: 3 },
  { product_idx: 4, item_idx: 7, quantity: 1 }
]

compositions_data.each do |attrs|
  Composition.find_or_create_by!(
    product: products[attrs[:product_idx]],
    item: items[attrs[:item_idx]]
  ) do |c|
    c.quantity = attrs[:quantity]
  end
end
puts "商品構成: #{compositions_data.size} 件作成"

# --------------------------------------------------
# 8. 在庫
# --------------------------------------------------
today = Date.today

stocks_data = [
  { item_idx: 0, quantity: 30, arrived_days_ago: 1 },
  { item_idx: 1, quantity: 20, arrived_days_ago: 1 },
  { item_idx: 2, quantity: 50, arrived_days_ago: 0 },
  { item_idx: 3, quantity: 15, arrived_days_ago: 2 },
  { item_idx: 4, quantity: 20, arrived_days_ago: 1 },
  { item_idx: 5, quantity: 20, arrived_days_ago: 0 },
  { item_idx: 6, quantity: 100, arrived_days_ago: 10 },
  { item_idx: 7, quantity: 200, arrived_days_ago: 10 }
]

stocks_data.each do |attrs|
  item = items[attrs[:item_idx]]
  arrived_date = today - attrs[:arrived_days_ago]
  expiry_date  = arrived_date + item.quality_retention_days

  Stock.find_or_create_by!(item: item, arrived_date: arrived_date) do |s|
    s.quantity    = attrs[:quantity]
    s.expiry_date = expiry_date
    s.status      = "available"
  end
end
puts "在庫: #{stocks_data.size} 件作成"

# --------------------------------------------------
# 9. サンプル受注
# --------------------------------------------------
now = Time.current

orders_data = [
  { customer_idx: 0, product_idx: 0, address_idx: 0, delivery_days: 3, message: "お誕生日おめでとうございます！",     status: "ordered" },
  { customer_idx: 0, product_idx: 1, address_idx: 1, delivery_days: 5, message: "いつもありがとう。",              status: "ordered" },
  { customer_idx: 1, product_idx: 2, address_idx: 2, delivery_days: 4, message: "ご結婚おめでとうございます。",      status: "ordered" },
  { customer_idx: 1, product_idx: 3, address_idx: 2, delivery_days: 2, message: nil,                            status: "shipped" },
  { customer_idx: 2, product_idx: 4, address_idx: 3, delivery_days: 3, message: "お見舞い申し上げます。",           status: "ordered" },
  { customer_idx: 2, product_idx: 0, address_idx: 3, delivery_days: 7, message: "母の日のプレゼントです。",         status: "ordered" }
]

orders_data.each do |attrs|
  customer = customer_users[attrs[:customer_idx]][:customer]
  product  = products[attrs[:product_idx]]

  order = Order.find_or_create_by!(
    customer: customer,
    product: product,
    delivery_address: delivery_addresses[attrs[:address_idx]],
    delivery_date: today + attrs[:delivery_days]
  ) do |o|
    o.price      = product.price
    o.message    = attrs[:message]
    o.status     = attrs[:status]
    o.ordered_at = now - 1.day
  end

  # 出荷済みの受注には Shipment を作成
  if attrs[:status] == "shipped" && order.shipment.blank?
    Shipment.create!(order: order, shipped_at: now - 6.hours)
  end
end
puts "受注: #{orders_data.size} 件作成"

# --------------------------------------------------
# 10. サンプル発注
# --------------------------------------------------
purchase_orders_data = [
  { item_idx: 0, supplier_idx: 0, quantity: 20, desired_days: 3, status: "ordered" },
  { item_idx: 3, supplier_idx: 1, quantity: 10, desired_days: 4, status: "ordered" },
  { item_idx: 5, supplier_idx: 2, quantity: 20, desired_days: 2, status: "arrived" }
]

purchase_orders_data.each do |attrs|
  item = items[attrs[:item_idx]]
  supplier = suppliers[attrs[:supplier_idx]]

  po = PurchaseOrder.find_or_create_by!(
    item: item,
    supplier: supplier,
    desired_delivery_date: today + attrs[:desired_days],
    status: attrs[:status]
  ) do |p|
    p.quantity   = attrs[:quantity]
    p.ordered_at = now - 2.days
  end

  # 入荷済みの発注には Arrival を作成
  if attrs[:status] == "arrived" && po.arrival.blank?
    Arrival.create!(
      purchase_order: po,
      item: item,
      quantity: attrs[:quantity],
      arrived_at: now - 12.hours
    )
  end
end
puts "発注: #{purchase_orders_data.size} 件作成"

puts ""
puts "=== シードデータ投入完了 ==="
puts ""
puts "--- ログイン情報 ---"
puts "スタッフ:  staff@example.com / password123"
puts "顧客1:    tanaka@example.com / password123"
puts "顧客2:    suzuki@example.com / password123"
puts "顧客3:    sato@example.com / password123"
