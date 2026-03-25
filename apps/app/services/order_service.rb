class OrderService
  def change_delivery_date(order:, new_date:)
    ActiveRecord::Base.transaction do
      order.lock!
      order.change_delivery_date!(new_date)
    end
  end

  def cancel(order:)
    ActiveRecord::Base.transaction do
      order.lock!
      order.cancel!
    end
  end
end
