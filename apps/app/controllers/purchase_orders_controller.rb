class PurchaseOrdersController < ApplicationController
  before_action :authenticate_user!
  before_action :require_staff!

  def index
    @purchase_orders = PurchaseOrder.includes(:item, :supplier).order(created_at: :desc)
    @purchase_orders = @purchase_orders.where(status: params[:status]) if params[:status].present?
  end

  def show
    @purchase_order = PurchaseOrder.includes(:item, :supplier, :arrival).find(params[:id])
  end

  def new
    @purchase_order = PurchaseOrder.new
    @items = Item.includes(:supplier).order(:name)
  end

  def create
    @items = Item.includes(:supplier).order(:name)
    item = Item.find(params[:purchase_order][:item_id])
    quantity = params[:purchase_order][:quantity].to_i
    desired_date = Date.parse(params[:purchase_order][:desired_delivery_date])

    service = PurchaseOrderService.new
    @purchase_order = service.create_order(item: item, quantity: quantity, desired_delivery_date: desired_date)
    redirect_to purchase_orders_path, notice: "発注を登録しました"
  rescue PurchaseOrderService::InvalidQuantityError, PurchaseOrderService::InvalidDateError => e
    @purchase_order = PurchaseOrder.new(purchase_order_params)
    flash.now[:alert] = e.message
    render :new, status: :unprocessable_entity
  end

  private

  def purchase_order_params
    params.require(:purchase_order).permit(:item_id, :quantity, :desired_delivery_date)
  end
end
