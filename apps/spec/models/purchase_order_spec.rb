require "rails_helper"

RSpec.describe PurchaseOrder, type: :model do
  describe "関連" do
    it { is_expected.to belong_to(:item) }
    it { is_expected.to belong_to(:supplier) }
    it { is_expected.to have_one(:arrival) }
  end

  describe "バリデーション" do
    it { is_expected.to validate_presence_of(:quantity) }
    it { is_expected.to validate_numericality_of(:quantity).is_greater_than(0) }
    it { is_expected.to validate_presence_of(:desired_delivery_date) }
    it { is_expected.to validate_presence_of(:status) }
    it { is_expected.to validate_presence_of(:ordered_at) }
  end

  describe "ステータス" do
    it "デフォルトステータスが ordered である" do
      new_po = PurchaseOrder.new
      expect(new_po.status).to eq("ordered")
    end

    it "ordered, arrived, cancelled のステータスを持つ" do
      expect(PurchaseOrder.statuses).to include("ordered", "arrived", "cancelled")
    end
  end

  describe "#cancel!" do
    let(:supplier) { create(:supplier) }
    let(:item) { create(:item, supplier: supplier) }

    it "発注をキャンセルできる" do
      po = PurchaseOrder.create!(
        item: item, supplier: supplier, quantity: 10,
        desired_delivery_date: 5.days.from_now.to_date,
        ordered_at: Time.current
      )
      po.cancel!
      expect(po.reload.status).to eq("cancelled")
    end

    it "入荷済みの発注はキャンセルできない" do
      po = PurchaseOrder.create!(
        item: item, supplier: supplier, quantity: 10,
        desired_delivery_date: 5.days.from_now.to_date,
        ordered_at: Time.current, status: "arrived"
      )
      expect { po.cancel! }.to raise_error(RuntimeError)
    end
  end

  describe "スコープ" do
    let(:supplier) { create(:supplier) }
    let(:item) { create(:item, supplier: supplier) }

    before do
      PurchaseOrder.create!(item: item, supplier: supplier, quantity: 10,
                            desired_delivery_date: 3.days.from_now.to_date,
                            ordered_at: Time.current, status: "ordered")
      PurchaseOrder.create!(item: item, supplier: supplier, quantity: 20,
                            desired_delivery_date: 1.day.ago.to_date,
                            ordered_at: 5.days.ago, status: "arrived")
    end

    it "pending スコープが発注済みのみを返す" do
      expect(PurchaseOrder.pending.count).to eq(1)
    end

    it "by_item スコープが指定した単品の発注を返す" do
      expect(PurchaseOrder.by_item(item.id).count).to eq(2)
    end
  end
end
