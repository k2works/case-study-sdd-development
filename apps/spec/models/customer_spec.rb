require "rails_helper"

RSpec.describe Customer, type: :model do
  describe "ファクトリ" do
    it "有効なファクトリを持つ" do
      expect(build(:customer)).to be_valid
    end
  end

  describe "バリデーション" do
    it { is_expected.to validate_presence_of(:name) }
  end

  describe "関連" do
    it { is_expected.to belong_to(:user) }
    it { is_expected.to have_many(:delivery_addresses) }
    it { is_expected.to have_many(:orders) }
  end
end
