class Order < ApplicationRecord
  class NotModifiableError < StandardError; end
  class InvalidDateError < StandardError; end

  belongs_to :customer
  belongs_to :product
  belongs_to :delivery_address
  has_one :shipment

  enum :status, { ordered: "ordered", shipped: "shipped", cancelled: "cancelled" }

  validates :delivery_date, presence: true
  validates :price, presence: true, numericality: { greater_than: 0 }
  validate :delivery_date_must_be_future, on: :create

  scope :by_delivery_date, ->(date) { where(delivery_date: date) }
  scope :by_status, ->(status) { where(status: status) }
  scope :for_shipping_date, ->(shipping_date) { where(delivery_date: shipping_date + 1.day, status: :ordered) }

  def shipping_date
    delivery_date - 1.day
  end

  def shippable?
    ordered? && shipping_date <= Date.current
  end

  def cancellable?
    ordered?
  end

  def cancel!
    raise NotModifiableError, "受注済み以外の注文はキャンセルできません" unless ordered?
    cancelled!
  end

  def change_delivery_date!(new_date)
    raise NotModifiableError, "受注済み以外の注文は届け日を変更できません" unless ordered?
    raise InvalidDateError, "届け日は未来日を指定してください" if new_date <= Date.current
    update!(delivery_date: new_date)
  end

  private

  def delivery_date_must_be_future
    if delivery_date.present? && delivery_date <= Date.current
      errors.add(:delivery_date, "は未来日を指定してください")
    end
  end
end
