class Item < ApplicationRecord
  belongs_to :supplier

  validates :name, presence: true
  validates :quality_retention_days, presence: true, numericality: { greater_than: 0 }
  validates :purchase_unit, presence: true, numericality: { greater_than: 0 }
  validates :lead_time_days, presence: true, numericality: { greater_than: 0 }
end
