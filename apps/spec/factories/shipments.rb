FactoryBot.define do
  factory :shipment do
    association :order
    shipped_at { Time.current }
  end
end
