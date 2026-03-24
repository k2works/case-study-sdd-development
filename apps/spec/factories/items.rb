FactoryBot.define do
  factory :item do
    name { "バラ（赤）" }
    quality_retention_days { 5 }
    purchase_unit { 10 }
    lead_time_days { 3 }
    association :supplier
  end
end
