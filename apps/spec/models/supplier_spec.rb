require "rails_helper"

RSpec.describe Supplier, type: :model do
  describe "ファクトリ" do
    it "有効なファクトリを持つ" do
      expect(build(:supplier)).to be_valid
    end
  end

  describe "バリデーション" do
    it { is_expected.to validate_presence_of(:name) }
  end

  describe "関連" do
    it { is_expected.to have_many(:items) }
  end
end
