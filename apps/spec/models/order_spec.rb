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
    it { is_expected.to have_one(:shipment) }
  end

  describe "#shipping_date" do
    it "届け日の前日を返す" do
      order = build(:order, delivery_date: Date.new(2026, 4, 15))
      expect(order.shipping_date).to eq(Date.new(2026, 4, 14))
    end
  end

  describe "#shippable?" do
    it "ordered 状態で出荷日が当日以前なら true" do
      order = build(:order, status: "ordered", delivery_date: Date.tomorrow)
      allow(Date).to receive(:current).and_return(order.shipping_date)
      expect(order.shippable?).to be true
    end

    it "ordered 状態で出荷日が未来なら false" do
      order = build(:order, status: "ordered", delivery_date: 5.days.from_now.to_date)
      expect(order.shippable?).to be false
    end

    it "shipped 状態なら false" do
      order = build(:order, status: "shipped", delivery_date: Date.tomorrow)
      expect(order.shippable?).to be false
    end

    it "cancelled 状態なら false" do
      order = build(:order, status: "cancelled", delivery_date: Date.tomorrow)
      expect(order.shippable?).to be false
    end
  end

  describe "#shipped?" do
    it "status が shipped なら true" do
      order = build(:order, status: "shipped")
      expect(order.shipped?).to be true
    end

    it "status が ordered なら false" do
      order = build(:order, status: "ordered")
      expect(order.shipped?).to be false
    end
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
