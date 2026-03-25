class OrdersController < ApplicationController
  before_action :authenticate_user!
  before_action :require_staff!
  before_action :set_order, only: [ :show, :update, :cancel ]

  def index
    @orders = Order.includes(:customer, :product, :delivery_address).order(created_at: :desc)
    @orders = @orders.by_delivery_date(params[:delivery_date]) if params[:delivery_date].present?
    @orders = @orders.by_status(params[:status]) if params[:status].present?
  end

  def show
    # 詳細表示のみを行うため、処理は view に委譲する
  end

  def update
    service = OrderService.new
    service.change_delivery_date(order: @order, new_date: Date.parse(params[:delivery_date]))
    redirect_to order_path(@order), notice: "届け日を変更しました"
  rescue Order::NotModifiableError, Order::InvalidDateError => e
    flash.now[:alert] = e.message
    render :show, status: :unprocessable_entity
  rescue ArgumentError
    flash.now[:alert] = "無効な日付です"
    render :show, status: :unprocessable_entity
  end

  def cancel
    service = OrderService.new
    service.cancel(order: @order)
    redirect_to orders_path, notice: "注文をキャンセルしました"
  rescue Order::NotModifiableError => e
    redirect_to order_path(@order), alert: e.message
  end

  private

  def set_order
    @order = Order.includes(:customer, :product, :delivery_address).find(params[:id])
  end
end
