class DeliveryAddress < ApplicationRecord
  belongs_to :customer

  validates :recipient_name, presence: true
  validates :address, presence: true
  validates :phone, presence: true

  scope :for_customer, ->(customer) { where(customer: customer).order(created_at: :desc) }
end
