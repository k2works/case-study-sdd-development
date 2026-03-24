class Supplier < ApplicationRecord
  has_many :items, dependent: :restrict_with_error

  validates :name, presence: true
end
