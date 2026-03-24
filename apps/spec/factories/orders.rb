FactoryBot.define do
  factory :order do
    association :customer
    association :product
    association :delivery_address
    delivery_date { 3.days.from_now.to_date }
    message { "お誕生日おめでとうございます" }
    price { 5500 }
    status { "ordered" }
    ordered_at { Time.current }
  end
end
