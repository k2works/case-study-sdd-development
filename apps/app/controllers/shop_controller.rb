class ShopController < ApplicationController
  before_action :authenticate_user!

  def index
    @products = Product.where(active: true).order(:name)
  end
end
