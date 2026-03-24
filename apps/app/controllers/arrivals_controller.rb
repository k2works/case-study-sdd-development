class ArrivalsController < ApplicationController
  before_action :authenticate_user!
  before_action :require_staff!
  before_action :set_purchase_order

  def new
    @arrival = Arrival.new(quantity: @purchase_order.quantity)
  end

  def create
    service = PurchaseOrderService.new
    quantity = params[:arrival][:quantity].to_i
    arrived_at = Date.parse(params[:arrival][:arrived_at])

    service.receive_arrival(purchase_order: @purchase_order, quantity: quantity, arrived_at: arrived_at)
    redirect_to purchase_order_path(@purchase_order), notice: "入荷を記録しました"
  rescue PurchaseOrderService::InvalidStatusError => e
    @arrival = Arrival.new(arrival_params)
    flash.now[:alert] = e.message
    render :new, status: :unprocessable_entity
  end

  private

  def set_purchase_order
    @purchase_order = PurchaseOrder.includes(:item, :supplier).find(params[:purchase_order_id])
  end

  def arrival_params
    params.require(:arrival).permit(:quantity, :arrived_at)
  end
end
