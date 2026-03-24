class Product < ApplicationRecord
  has_many :compositions, dependent: :destroy
  has_many :items, through: :compositions

  validates :name, presence: true
  validates :price, presence: true, numericality: { greater_than: 0 }
end
