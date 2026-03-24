class Composition < ApplicationRecord
  belongs_to :product
  belongs_to :item

  validates :quantity, presence: true, numericality: { greater_than: 0 }
end
