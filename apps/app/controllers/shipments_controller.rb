class ShipmentsController < ApplicationController
  before_action :authenticate_user!
  before_action :require_staff!

  def index
    @shipping_date = params[:shipping_date].present? ? Date.parse(params[:shipping_date]) : Date.current
    delivery_date = @shipping_date + 1.day

    @orders = Order.includes(:customer, :product, product: { compositions: :item })
                   .where(delivery_date: delivery_date, status: "ordered")
                   .order(:id)
  end

  def create
    order_ids = Array(params[:order_ids]).map(&:to_i).reject(&:zero?)

    if order_ids.empty?
      redirect_to shipments_path, alert: "出荷対象を選択してください"
      return
    end

    orders = Order.where(id: order_ids, status: "ordered")
    service = ShippingService.new

    service.ship_all(orders)
    redirect_to shipments_path, notice: "#{orders.size}件の出荷処理が完了しました"
  rescue ShippingService::AlreadyShippedError,
         ShippingService::InvalidStatusError,
         ShippingService::InsufficientStockError => e
    redirect_to shipments_path, alert: e.message
  end
end
