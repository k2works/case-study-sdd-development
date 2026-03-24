class OrdersController < ApplicationController
  before_action :authenticate_user!
  before_action :require_staff!

  def index
    @orders = Order.includes(:customer, :product, :delivery_address).order(created_at: :desc)
    @orders = @orders.by_delivery_date(params[:delivery_date]) if params[:delivery_date].present?
    @orders = @orders.by_status(params[:status]) if params[:status].present?
  end

  def show
    @order = Order.includes(:customer, :product, :delivery_address).find(params[:id])
  end
end
