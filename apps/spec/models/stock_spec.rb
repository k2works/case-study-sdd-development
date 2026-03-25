require "rails_helper"

RSpec.describe Stock, type: :model do
  describe "関連" do
    it { is_expected.to belong_to(:item) }
  end

  describe "バリデーション" do
    it { is_expected.to validate_presence_of(:quantity) }
    it { is_expected.to validate_numericality_of(:quantity).is_greater_than_or_equal_to(0) }
    it { is_expected.to validate_presence_of(:arrived_date) }
    it { is_expected.to validate_presence_of(:expiry_date) }
    it { is_expected.to validate_presence_of(:status) }
  end

  describe "ステータス" do
    let(:supplier) { create(:supplier) }
    let(:item) { create(:item, supplier: supplier) }
    let(:stock) do
      Stock.create!(
        item: item,
        quantity: 10,
        arrived_date: Date.current,
        expiry_date: Date.current + item.quality_retention_days.days,
        status: "available"
      )
    end

    it "デフォルトステータスが available である" do
      new_stock = Stock.new
      expect(new_stock.status).to eq("available")
    end

    it "available, allocated, expired のステータスを持つ" do
      expect(Stock.statuses).to include("available", "allocated", "expired")
    end
  end

  describe "#expired?" do
    let(:supplier) { create(:supplier) }
    let(:item) { create(:item, supplier: supplier, quality_retention_days: 5) }

    it "品質維持期限を超過した場合は true を返す" do
      stock = Stock.create!(
        item: item,
        quantity: 10,
        arrived_date: 10.days.ago.to_date,
        expiry_date: 5.days.ago.to_date,
        status: "available"
      )
      expect(stock.expired?).to be true
    end

    it "品質維持期限内の場合は false を返す" do
      stock = Stock.create!(
        item: item,
        quantity: 10,
        arrived_date: Date.current,
        expiry_date: Date.current + 5.days,
        status: "available"
      )
      expect(stock.expired?).to be false
    end
  end

  describe "#available_quantity" do
    let(:supplier) { create(:supplier) }
    let(:item) { create(:item, supplier: supplier) }

    it "available ステータスの在庫数量を返す" do
      stock = Stock.create!(
        item: item,
        quantity: 10,
        arrived_date: Date.current,
        expiry_date: Date.current + 5.days,
        status: "available"
      )
      expect(stock.available_quantity).to eq(10)
    end

    it "expired ステータスの場合は 0 を返す" do
      stock = Stock.create!(
        item: item,
        quantity: 10,
        arrived_date: 10.days.ago.to_date,
        expiry_date: 5.days.ago.to_date,
        status: "expired"
      )
      expect(stock.available_quantity).to eq(0)
    end
  end

  describe "スコープ" do
    let(:supplier) { create(:supplier) }
    let(:item) { create(:item, supplier: supplier, quality_retention_days: 5) }

    before do
      Stock.create!(item: item, quantity: 10, arrived_date: Date.current,
                     expiry_date: Date.current + 5.days, status: "available")
      Stock.create!(item: item, quantity: 5, arrived_date: Date.current,
                     expiry_date: Date.current + 5.days, status: "allocated")
      Stock.create!(item: item, quantity: 3, arrived_date: 10.days.ago.to_date,
                     expiry_date: 5.days.ago.to_date, status: "expired")
    end

    it "available スコープが良品在庫のみを返す" do
      expect(Stock.available.count).to eq(1)
      expect(Stock.available.first.quantity).to eq(10)
    end

    it "by_item スコープが指定した単品の在庫を返す" do
      expect(Stock.by_item(item.id).count).to eq(3)
    end

    it "not_expired_on スコープが指定日に期限内の在庫を返す" do
      expect(Stock.not_expired_on(Date.current).count).to eq(2)
    end
  end
end
