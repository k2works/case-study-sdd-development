class StockForecastsController < ApplicationController
  before_action :authenticate_user!
  before_action :require_staff!

  def index
    @items = Item.includes(:supplier).order(:name)

    if params[:item_id].present?
      @selected_item = Item.find_by(id: params[:item_id])
      return unless @selected_item

      @start_date = parse_date(params[:start_date], Date.current)
      @end_date = parse_date(params[:end_date], @start_date + 13.days)
      service = StockForecastService.new(current_date: Date.current)
      @forecast = service.forecast(@selected_item, @start_date, @end_date)
    end
  end

  private

  def parse_date(value, default)
    return default if value.blank?
    Date.parse(value)
  rescue Date::Error
    default
  end
end
