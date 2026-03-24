FactoryBot.define do
  factory :purchase_order do
    association :item
    association :supplier
    quantity { 10 }
    desired_delivery_date { 5.days.from_now.to_date }
    ordered_at { Time.current }
    status { "ordered" }
  end
end
