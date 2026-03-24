class Order < ApplicationRecord
  STATUSES = %w[ordered shipped cancelled].freeze

  belongs_to :customer
  belongs_to :product
  belongs_to :delivery_address

  validates :delivery_date, presence: true
  validates :price, presence: true, numericality: { greater_than: 0 }
  validates :status, presence: true, inclusion: { in: STATUSES }
  validate :delivery_date_must_be_future, on: :create

  scope :by_delivery_date, ->(date) { where(delivery_date: date) }
  scope :by_status, ->(status) { where(status: status) }

  def shipping_date
    delivery_date - 1.day
  end

  private

  def delivery_date_must_be_future
    if delivery_date.present? && delivery_date <= Date.current
      errors.add(:delivery_date, "は未来日を指定してください")
    end
  end
end
