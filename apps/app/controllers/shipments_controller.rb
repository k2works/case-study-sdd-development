class ShipmentsController < ApplicationController
  before_action :authenticate_user!
  before_action :require_staff!

  def index
    @shipping_date = parse_shipping_date
    @orders = Order.includes(:customer, :product, product: { compositions: :item })
                   .for_shipping_date(@shipping_date)
                   .order(:id)
  end

  def create
    order_ids = Array(params[:order_ids]).map(&:to_i).reject(&:zero?)

    if order_ids.empty?
      redirect_to shipments_path(shipping_date: params[:shipping_date]), alert: "出荷対象を選択してください"
      return
    end

    orders = Order.includes(:product, product: { compositions: :item })
                  .where(id: order_ids, status: "ordered")
    service = ShippingService.new

    shipments = service.ship_all(orders)
    redirect_to shipments_path(shipping_date: params[:shipping_date]),
                notice: "#{shipments.size}件の出荷処理が完了しました"
  rescue ShippingService::AlreadyShippedError,
         ShippingService::InvalidStatusError,
         ShippingService::InsufficientStockError => e
    redirect_to shipments_path(shipping_date: params[:shipping_date]), alert: e.message
  end

  private

  def parse_shipping_date
    return Date.current unless params[:shipping_date].present?

    Date.parse(params[:shipping_date])
  rescue Date::Error
    Date.current
  end
end
