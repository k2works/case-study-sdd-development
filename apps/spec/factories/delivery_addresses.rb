FactoryBot.define do
  factory :delivery_address do
    association :customer
    recipient_name { "山田花子" }
    address { "東京都渋谷区神宮前1-1-1" }
    phone { "03-1234-5678" }
  end
end
