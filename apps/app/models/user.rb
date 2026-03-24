class User < ApplicationRecord
  ROLES = %w[customer staff].freeze

  has_one :customer, dependent: :destroy

  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

  validates :role, presence: true, inclusion: { in: ROLES }
  validates :name, length: { maximum: 100 }

  def customer?
    role == "customer"
  end

  def staff?
    role == "staff"
  end
end
