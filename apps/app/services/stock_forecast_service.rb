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
      effective_stock = available_stock + incoming - allocated - expired

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

  def calculate_allocations(item, start_date, end_date)
    compositions = Composition.where(item_id: item.id)
    return {} if compositions.empty?

    product_ids = compositions.pluck(:product_id)
    quantities_by_product = compositions.index_by(&:product_id)

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
