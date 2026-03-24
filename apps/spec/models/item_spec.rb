require "rails_helper"

RSpec.describe Item, type: :model do
  describe "ファクトリ" do
    it "有効なファクトリを持つ" do
      expect(build(:item)).to be_valid
    end
  end

  describe "バリデーション" do
    it { is_expected.to validate_presence_of(:name) }
    it { is_expected.to validate_presence_of(:quality_retention_days) }
    it { is_expected.to validate_numericality_of(:quality_retention_days).is_greater_than(0) }
    it { is_expected.to validate_presence_of(:purchase_unit) }
    it { is_expected.to validate_numericality_of(:purchase_unit).is_greater_than(0) }
    it { is_expected.to validate_presence_of(:lead_time_days) }
    it { is_expected.to validate_numericality_of(:lead_time_days).is_greater_than(0) }
  end

  describe "関連" do
    it { is_expected.to belong_to(:supplier) }
  end
end
