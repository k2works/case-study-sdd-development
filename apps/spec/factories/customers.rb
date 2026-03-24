FactoryBot.define do
  factory :customer do
    association :user, role: "customer"
    name { "田中太郎" }
    phone { "090-1234-5678" }
  end
end
