class Customer < ApplicationRecord
  belongs_to :user
  has_many :delivery_addresses, dependent: :destroy
  has_many :orders, dependent: :restrict_with_error

  validates :name, presence: true
end
