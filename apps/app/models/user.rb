class User < ApplicationRecord
  ROLES = %w[customer staff].freeze

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
# test comment
