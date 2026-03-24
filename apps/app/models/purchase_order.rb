class PurchaseOrder < ApplicationRecord
  belongs_to :item
  belongs_to :supplier
  has_one :arrival, dependent: :restrict_with_error

  enum :status, {
    ordered: "ordered",
    arrived: "arrived",
    cancelled: "cancelled"
  }

  validates :quantity, presence: true, numericality: { greater_than: 0 }
  validates :desired_delivery_date, presence: true
  validates :status, presence: true
  validates :ordered_at, presence: true

  scope :pending, -> { where(status: "ordered") }
  scope :by_item, ->(item_id) { where(item_id: item_id) }

  def cancel!
    raise "入荷済みの発注はキャンセルできません" if arrived?
    update!(status: :cancelled)
  end
end
