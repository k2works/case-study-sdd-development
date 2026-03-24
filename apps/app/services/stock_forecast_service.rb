class StockForecastService
  def initialize(current_date: Date.current)
    @current_date = current_date
  end

  def forecast(item, start_date, end_date)
    stocks = Stock.by_item(item.id).available
    pending_orders = PurchaseOrder.by_item(item.id).pending
    allocated_by_date = calculate_allocations(item, start_date, end_date)

    (start_date..end_date).map do |date|
      available_stock = calculate_available_stock(stocks, date)
      incoming = calculate_incoming(pending_orders, date)
      allocated = allocated_by_date[date] || 0
      expired = calculate_expired(stocks, date)
      # 有効在庫 = 良品在庫 + 入荷予定 - 引当済み
      # expired は表示用（available_stock から既に除外されているため計算に含めない）
      effective_stock = available_stock + incoming - allocated

      {
        date: date,
        available_stock: available_stock,
        incoming: incoming,
        allocated: allocated,
        expired: expired,
        effective_stock: effective_stock
      }
    end
  end

  private

  def calculate_available_stock(stocks, date)
    stocks.select { |s| s.expiry_date >= date }.sum(&:quantity)
  end

  def calculate_incoming(pending_orders, date)
    pending_orders.select { |po| po.desired_delivery_date <= date }.sum(&:quantity)
  end

  def calculate_expired(stocks, date)
    stocks.select { |s| s.expiry_date < date }.sum(&:quantity)
  end

  # 引当計算: 受注の届け日（delivery_date）の前日を出荷日とし、
  # 出荷日に必要な単品数量を引当として計上する。
  # 引当数量 = 商品構成の必要数量（Composition#quantity）
  def calculate_allocations(item, start_date, end_date)
    compositions = Composition.where(item_id: item.id)
    return {} if compositions.empty?

    product_ids = compositions.pluck(:product_id)
    quantities_by_product = compositions.index_by(&:product_id)

    # 出荷日が期間内の受注を取得（出荷日 = 届け日 - 1 日のため、届け日を +1 日オフセット）
    orders = Order.where(product_id: product_ids, status: "ordered")
      .where(delivery_date: (start_date + 1.day)..(end_date + 1.day))

    allocations = Hash.new(0)
    orders.each do |order|
      shipping_date = order.delivery_date - 1.day
      next unless shipping_date.between?(start_date, end_date)

      composition = quantities_by_product[order.product_id]
      allocations[shipping_date] += composition.quantity if composition
    end

    allocations
  end
end
