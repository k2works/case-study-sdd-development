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
  end

  describe "enum" do
    it "status が enum として定義されている" do
      expect(Order.statuses).to eq("ordered" => "ordered", "shipped" => "shipped", "cancelled" => "cancelled")
    end

    it "ordered? が正しく動作する" do
      order = build(:order, status: :ordered)
      expect(order.ordered?).to be true
      expect(order.shipped?).to be false
      expect(order.cancelled?).to be false
    end

    it "shipped? が正しく動作する" do
      order = build(:order, status: :shipped)
      expect(order.shipped?).to be true
      expect(order.ordered?).to be false
    end

    it "cancelled? が正しく動作する" do
      order = build(:order, status: :cancelled)
      expect(order.cancelled?).to be true
      expect(order.ordered?).to be false
    end
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
      order = build(:order, status: :ordered, delivery_date: Date.tomorrow)
      allow(Date).to receive(:current).and_return(order.shipping_date)
      expect(order.shippable?).to be true
    end

    it "ordered 状態で出荷日が未来なら false" do
      order = build(:order, status: :ordered, delivery_date: 5.days.from_now.to_date)
      expect(order.shippable?).to be false
    end

    it "shipped 状態なら false" do
      order = build(:order, status: :shipped, delivery_date: Date.tomorrow)
      expect(order.shippable?).to be false
    end

    it "cancelled 状態なら false" do
      order = build(:order, status: :cancelled, delivery_date: Date.tomorrow)
      expect(order.shippable?).to be false
    end
  end

  describe "#shipped?" do
    it "status が shipped なら true" do
      order = build(:order, status: :shipped)
      expect(order.shipped?).to be true
    end

    it "status が ordered なら false" do
      order = build(:order, status: :ordered)
      expect(order.shipped?).to be false
    end
  end

  describe "#cancellable?" do
    it "ordered 状態なら true" do
      order = build(:order, status: :ordered)
      expect(order.cancellable?).to be true
    end

    it "shipped 状態なら false" do
      order = build(:order, status: :shipped)
      expect(order.cancellable?).to be false
    end

    it "cancelled 状態なら false" do
      order = build(:order, status: :cancelled)
      expect(order.cancellable?).to be false
    end
  end

  describe "#cancel!" do
    it "ordered 状態からキャンセルできる" do
      order = create(:order, status: :ordered)
      order.cancel!
      expect(order.reload.cancelled?).to be true
    end

    it "shipped 状態からはキャンセルできない" do
      order = create(:order, status: :shipped)
      expect { order.cancel! }.to raise_error(Order::NotModifiableError)
    end

    it "cancelled 状態からはキャンセルできない" do
      order = create(:order, status: :cancelled)
      expect { order.cancel! }.to raise_error(Order::NotModifiableError)
    end
  end

  describe "#change_delivery_date!" do
    it "ordered 状態で未来日に届け日を変更できる" do
      order = create(:order, status: :ordered)
      new_date = 10.days.from_now.to_date
      order.change_delivery_date!(new_date)
      expect(order.reload.delivery_date).to eq(new_date)
    end

    it "shipped 状態からは変更できない" do
      order = create(:order, status: :shipped)
      expect { order.change_delivery_date!(10.days.from_now.to_date) }.to raise_error(Order::NotModifiableError)
    end

    it "cancelled 状態からは変更できない" do
      order = create(:order, status: :cancelled)
      expect { order.change_delivery_date!(10.days.from_now.to_date) }.to raise_error(Order::NotModifiableError)
    end

    it "過去日への変更は不可" do
      order = create(:order, status: :ordered)
      expect { order.change_delivery_date!(Date.yesterday) }.to raise_error(Order::InvalidDateError)
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
