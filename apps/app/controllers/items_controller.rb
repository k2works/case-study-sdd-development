class ItemsController < ApplicationController
  before_action :authenticate_user!
  before_action :require_staff!
  before_action :set_item, only: [ :edit, :update ]

  def index
    @items = Item.includes(:supplier).order(created_at: :desc)
  end

  def new
    @item = Item.new
  end

  def create
    @item = Item.new(item_params)
    if @item.save
      redirect_to items_path, notice: "単品を登録しました"
    else
      render :new, status: :unprocessable_entity
    end
  end

  def edit
    # @item は before_action で設定済み
  end

  def update
    if @item.update(item_params)
      redirect_to items_path, notice: "単品を更新しました"
    else
      render :edit, status: :unprocessable_entity
    end
  end

  private

  def set_item
    @item = Item.find(params[:id])
  end

  def item_params
    params.require(:item).permit(:name, :quality_retention_days, :purchase_unit, :lead_time_days, :supplier_id)
  end
end
