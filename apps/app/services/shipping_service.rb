class ShippingService
  class AlreadyShippedError < StandardError; end
  class InvalidStatusError < StandardError; end
  class InsufficientStockError < StandardError; end

  def initialize(current_date: Date.current)
    @current_date = current_date
  end

  def ship(order)
    validate_order_status(order)

    ActiveRecord::Base.transaction do
      consume_stock(order)

      shipment = Shipment.create!(
        order: order,
        shipped_at: Time.current
      )

      order.update!(status: "shipped")

      shipment
    end
  end

  def ship_all(orders)
    orders.map { |order| ship(order) }
  end

  private

  def validate_order_status(order)
    raise AlreadyShippedError, "この受注は既に出荷済みです" if order.shipped?
    raise InvalidStatusError, "受注済みの状態でのみ出荷できます" unless order.ordered?
  end

  def consume_stock(order)
    order.product.compositions.includes(:item).each do |composition|
      consume_item_stock(composition.item, composition.quantity)
    end
  end

  def consume_item_stock(item, required_quantity)
    remaining = required_quantity
    stocks = Stock.where(item: item, status: "available")
                  .where("expiry_date >= ?", @current_date)
                  .order(expiry_date: :asc)

    stocks.each do |stock|
      break if remaining <= 0

      deduct = [stock.quantity, remaining].min
      stock.update!(quantity: stock.quantity - deduct)
      remaining -= deduct
    end

    if remaining > 0
      raise InsufficientStockError, "#{item.name}の在庫が不足しています（不足数: #{remaining}）"
    end
  end
end
