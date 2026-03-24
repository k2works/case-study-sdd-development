FactoryBot.define do
  factory :user do
    sequence(:email) { |n| "user#{n}@example.com" }
    password { "password123" }
    password_confirmation { "password123" }
    name { "テストユーザー" }
    role { "customer" }

    trait :staff do
      role { "staff" }
      sequence(:email) { |n| "staff#{n}@example.com" }
    end
  end
end
