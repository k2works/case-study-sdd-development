class Shop::OrdersController < ApplicationController
  before_action :authenticate_user!
  before_action :ensure_customer

  def new
    @product = Product.find(params[:product_id])
    @order = Order.new
  end

  def confirm
    @product = Product.find(order_params[:product_id])
    @order_params = order_params
    render :confirm
  end

  def create
    @product = Product.find(order_params[:product_id])
    customer = current_user.customer

    ActiveRecord::Base.transaction do
      delivery_address = customer.delivery_addresses.create!(
        recipient_name: order_params[:recipient_name],
        address: order_params[:address],
        phone: order_params[:phone]
      )

      @order = Order.new(
        customer: customer,
        product: @product,
        delivery_address: delivery_address,
        delivery_date: order_params[:delivery_date],
        message: order_params[:message],
        price: @product.price,
        status: "ordered",
        ordered_at: Time.current
      )

      if @order.save
        redirect_to complete_shop_orders_path
      else
        raise ActiveRecord::Rollback
      end
    end

    render :new, status: :unprocessable_entity unless @order&.persisted?
  end

  def complete
  end

  private

  def ensure_customer
    unless current_user.customer
      current_user.create_customer!(name: current_user.name || current_user.email, phone: "")
    end
  end

  def order_params
    params.require(:order).permit(:product_id, :delivery_date, :recipient_name, :address, :phone, :message)
  end
end
