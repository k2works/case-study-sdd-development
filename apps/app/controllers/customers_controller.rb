class CustomersController < ApplicationController
  before_action :authenticate_user!
  before_action :require_staff!
  before_action :set_customer, only: [ :edit, :update ]

  def index
    @customers = Customer.includes(:user).order(:name)
  end

  def edit
  end

  def update
    if @customer.update(customer_params)
      redirect_to customers_path, notice: "得意先情報を更新しました"
    else
      render :edit, status: :unprocessable_entity
    end
  end

  private

  def set_customer
    @customer = Customer.find(params[:id])
  end

  def customer_params
    params.require(:customer).permit(:name, :phone)
  end
end
