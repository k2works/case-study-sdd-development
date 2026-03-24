FactoryBot.define do
  factory :composition do
    association :product
    association :item
    quantity { 5 }
  end
end
