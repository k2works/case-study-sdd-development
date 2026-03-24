require "rails_helper"

RSpec.describe DeliveryAddress, type: :model do
  describe "ファクトリ" do
    it "有効なファクトリを持つ" do
      expect(build(:delivery_address)).to be_valid
    end
  end

  describe "バリデーション" do
    it { is_expected.to validate_presence_of(:recipient_name) }
    it { is_expected.to validate_presence_of(:address) }
    it { is_expected.to validate_presence_of(:phone) }
  end

  describe "関連" do
    it { is_expected.to belong_to(:customer) }
  end
end
