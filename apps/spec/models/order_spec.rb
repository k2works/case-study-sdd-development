require "rails_helper"

RSpec.describe Order, type: :model do
  describe "ファクトリ" do
    it "有効なファクトリを持つ" do
      expect(build(:order)).to be_valid
    end
  end

  describe "バリデーション" do
    it { is_expected.to validate_presence_of(:delivery_date) }
    it { is_expected.to validate_presence_of(:price) }
    it { is_expected.to validate_numericality_of(:price).is_greater_than(0) }
    it { is_expected.to validate_presence_of(:status) }
    it { is_expected.to validate_inclusion_of(:status).in_array(Order::STATUSES) }
  end

  describe "関連" do
    it { is_expected.to belong_to(:customer) }
    it { is_expected.to belong_to(:product) }
    it { is_expected.to belong_to(:delivery_address) }
  end

  describe "届け日バリデーション" do
    it "届け日が過去日の場合は無効" do
      order = build(:order, delivery_date: Date.yesterday)
      expect(order).not_to be_valid
      expect(order.errors[:delivery_date]).to be_present
    end

    it "届け日が未来日の場合は有効" do
      order = build(:order, delivery_date: Date.tomorrow)
      expect(order).to be_valid
    end
  end
end
