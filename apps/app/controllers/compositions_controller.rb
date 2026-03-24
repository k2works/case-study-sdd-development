class CompositionsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_product

  def index
    @compositions = @product.compositions.includes(:item)
    @composition = @product.compositions.new
  end

  def create
    @composition = @product.compositions.new(composition_params)
    if @composition.save
      redirect_to product_compositions_path(@product), notice: "構成を追加しました"
    else
      @compositions = @product.compositions.includes(:item)
      render :index, status: :unprocessable_entity
    end
  end

  def destroy
    composition = @product.compositions.find(params[:id])
    composition.destroy
    redirect_to product_compositions_path(@product), notice: "構成を削除しました"
  end

  private

  def set_product
    @product = Product.find(params[:product_id])
  end

  def composition_params
    params.require(:composition).permit(:item_id, :quantity)
  end
end
