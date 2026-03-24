class DeliveryAddress < ApplicationRecord
  belongs_to :customer

  validates :recipient_name, presence: true
  validates :address, presence: true
  validates :phone, presence: true
end
