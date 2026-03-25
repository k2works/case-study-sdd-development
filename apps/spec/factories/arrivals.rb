FactoryBot.define do
  factory :arrival do
    association :purchase_order
    association :item
    quantity { 10 }
    arrived_at { Time.current }
  end
end
