FactoryBot.define do
  factory :stock do
    association :item
    quantity { 10 }
    arrived_date { Date.current }
    expiry_date { Date.current + 5.days }
    status { "available" }
  end
end
