class Shipment < ApplicationRecord
  belongs_to :order

  validates :shipped_at, presence: true
  validates :order_id, uniqueness: true
end
