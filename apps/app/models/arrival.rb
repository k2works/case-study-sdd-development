class Arrival < ApplicationRecord
  belongs_to :purchase_order
  belongs_to :item

  validates :quantity, presence: true, numericality: { greater_than: 0 }
  validates :arrived_at, presence: true
  validates :purchase_order_id, uniqueness: true
end
