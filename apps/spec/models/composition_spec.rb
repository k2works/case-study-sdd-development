require "rails_helper"

RSpec.describe Composition, type: :model do
  describe "ファクトリ" do
    it "有効なファクトリを持つ" do
      expect(build(:composition)).to be_valid
    end
  end

  describe "バリデーション" do
    it { is_expected.to validate_presence_of(:quantity) }
    it { is_expected.to validate_numericality_of(:quantity).is_greater_than(0) }
  end

  describe "関連" do
    it { is_expected.to belong_to(:product) }
    it { is_expected.to belong_to(:item) }
  end
end
