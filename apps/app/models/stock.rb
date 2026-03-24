class Stock < ApplicationRecord
  belongs_to :item

  enum :status, {
    available: "available",
    allocated: "allocated",
    expired: "expired"
  }

  validates :quantity, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :arrived_date, presence: true
  validates :expiry_date, presence: true
  validates :status, presence: true

  scope :by_item, ->(item_id) { where(item_id: item_id) }
  scope :not_expired_on, ->(date) { where("expiry_date >= ?", date) }

  def expired?
    expiry_date < Date.current
  end

  def available_quantity
    available? ? quantity : 0
  end
end
