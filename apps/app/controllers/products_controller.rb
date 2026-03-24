class ProductsController < ApplicationController
  before_action :authenticate_user!
  before_action :require_staff!
  before_action :set_product, only: [ :edit, :update ]

  def index
    @products = Product.all.order(created_at: :desc)
  end

  def new
    @product = Product.new
  end

  def create
    @product = Product.new(product_params)
    if @product.save
      redirect_to products_path, notice: "商品を登録しました"
    else
      render :new, status: :unprocessable_entity
    end
  end

  def edit
    # @product は before_action で設定済み
  end

  def update
    if @product.update(product_params)
      redirect_to products_path, notice: "商品を更新しました"
    else
      render :edit, status: :unprocessable_entity
    end
  end

  private

  def set_product
    @product = Product.find(params[:id])
  end

  def product_params
    params.require(:product).permit(:name, :description, :price, :active)
  end
end
