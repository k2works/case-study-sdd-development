class PurchaseOrderService
  class InvalidQuantityError < StandardError; end
  class InvalidDateError < StandardError; end
  class InvalidStatusError < StandardError; end

  def initialize(current_date: Date.current)
    @current_date = current_date
  end

  def create_order(item:, quantity:, desired_delivery_date:)
    validate_quantity(item, quantity)
    validate_date(desired_delivery_date)

    PurchaseOrder.create!(
      item: item,
      supplier: item.supplier,
      quantity: quantity,
      desired_delivery_date: desired_delivery_date,
      ordered_at: Time.current,
      status: :ordered
    )
  end

  def receive_arrival(purchase_order:, quantity:, arrived_at:)
    raise InvalidStatusError, "発注済みの状態でのみ入荷を記録できます" unless purchase_order.ordered?

    ActiveRecord::Base.transaction do
      arrival = Arrival.create!(
        purchase_order: purchase_order,
        item: purchase_order.item,
        quantity: quantity,
        arrived_at: arrived_at
      )

      Stock.create!(
        item: purchase_order.item,
        quantity: quantity,
        arrived_date: arrived_at.to_date,
        expiry_date: arrived_at.to_date + purchase_order.item.quality_retention_days.days,
        status: :available
      )

      purchase_order.update!(status: :arrived)

      arrival
    end
  end

  private

  def validate_quantity(item, quantity)
    if quantity <= 0 || quantity % item.purchase_unit != 0
      raise InvalidQuantityError, "発注数量は購入単位（#{item.purchase_unit}）の整数倍で指定してください"
    end
  end

  def validate_date(date)
    raise InvalidDateError, "希望納品日は本日以降を指定してください" if date < @current_date
  end
end
