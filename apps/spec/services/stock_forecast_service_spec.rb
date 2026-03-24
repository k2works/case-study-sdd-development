require "rails_helper"

RSpec.describe StockForecastService, type: :service do
  let(:supplier) { create(:supplier) }
  let(:item) { create(:item, supplier: supplier, quality_retention_days: 5) }
  let(:base_date) { Date.new(2026, 4, 1) }
  let(:service) { described_class.new(current_date: base_date) }

  describe "#forecast" do
    context "在庫がない場合" do
      it "すべての日で 0 を返す" do
        result = service.forecast(item, base_date, base_date + 6.days)
        expect(result.size).to eq(7)
        result.each do |daily|
          expect(daily[:available_stock]).to eq(0)
          expect(daily[:incoming]).to eq(0)
          expect(daily[:allocated]).to eq(0)
          expect(daily[:expired]).to eq(0)
          expect(daily[:effective_stock]).to eq(0)
        end
      end
    end

    context "良品在庫がある場合" do
      before do
        Stock.create!(
          item: item, quantity: 30,
          arrived_date: base_date - 2.days,
          expiry_date: base_date + 3.days,
          status: "available"
        )
      end

      it "品質維持期限内の在庫を良品在庫として返す" do
        result = service.forecast(item, base_date, base_date + 6.days)
        # 4/1〜4/4 は期限内（expiry_date = 4/4）
        expect(result[0][:available_stock]).to eq(30)
        expect(result[3][:available_stock]).to eq(30)
        # 4/5 以降は期限超過で廃棄対象
        expect(result[4][:available_stock]).to eq(0)
        expect(result[4][:expired]).to eq(30)
      end

      it "有効在庫 = 良品在庫 + 入荷予定 - 引当済み を計算する（expired は表示用）" do
        result = service.forecast(item, base_date, base_date + 6.days)
        expect(result[0][:effective_stock]).to eq(30) # 良品30 + 入荷0 - 引当0
        expect(result[4][:effective_stock]).to eq(0)  # 良品0 + 入荷0 - 引当0（expired は計算に含めない）
      end
    end

    context "入荷予定がある場合" do
      before do
        PurchaseOrder.create!(
          item: item, supplier: supplier, quantity: 20,
          desired_delivery_date: base_date + 2.days,
          ordered_at: base_date - 3.days, status: "ordered"
        )
      end

      it "希望納品日以降に入荷予定として反映される" do
        result = service.forecast(item, base_date, base_date + 6.days)
        # 4/1, 4/2 は入荷前
        expect(result[0][:incoming]).to eq(0)
        expect(result[1][:incoming]).to eq(0)
        # 4/3 以降は入荷予定
        expect(result[2][:incoming]).to eq(20)
        expect(result[3][:incoming]).to eq(20)
      end

      it "入荷済みの発注は入荷予定に含まない" do
        PurchaseOrder.first.update!(status: "arrived")
        result = service.forecast(item, base_date, base_date + 6.days)
        result.each do |daily|
          expect(daily[:incoming]).to eq(0)
        end
      end
    end

    context "引当（受注）がある場合" do
      let(:customer_user) { create(:user, role: "customer") }
      let(:customer) { create(:customer, user: customer_user) }
      let(:product) { create(:product) }
      let(:delivery_address) { create(:delivery_address, customer: customer) }

      before do
        # 商品構成: product に item が 5 本必要
        Composition.create!(product: product, item: item, quantity: 5)
        # 受注: 届け日 4/4 → 出荷日 4/3
        Order.create!(
          customer: customer, product: product,
          delivery_address: delivery_address,
          delivery_date: base_date + 3.days,
          price: product.price, status: "ordered",
          ordered_at: base_date
        )
      end

      it "出荷日（届け日の前日）に引当数量が反映される" do
        result = service.forecast(item, base_date, base_date + 6.days)
        # 届け日 = base_date + 3 → 出荷日 = base_date + 2
        expect(result[2][:allocated]).to eq(5) # 4/3: 引当 5 本
        expect(result[0][:allocated]).to eq(0) # 4/1: 引当なし
      end
    end

    context "複合シナリオ" do
      let(:customer_user) { create(:user, role: "customer") }
      let(:customer) { create(:customer, user: customer_user) }
      let(:product) { create(:product) }
      let(:delivery_address) { create(:delivery_address, customer: customer) }

      before do
        # 在庫: 30 本（4/4 まで有効）
        Stock.create!(
          item: item, quantity: 30,
          arrived_date: base_date - 2.days,
          expiry_date: base_date + 3.days,
          status: "available"
        )
        # 入荷予定: 20 本（4/3 納品予定）
        PurchaseOrder.create!(
          item: item, supplier: supplier, quantity: 20,
          desired_delivery_date: base_date + 2.days,
          ordered_at: base_date - 3.days, status: "ordered"
        )
        # 受注: item 5 本 x 2 注文（届け日 4/3, 4/5）
        Composition.create!(product: product, item: item, quantity: 5)
        Order.create!(
          customer: customer, product: product,
          delivery_address: delivery_address,
          delivery_date: base_date + 2.days,
          price: product.price, status: "ordered",
          ordered_at: base_date
        )
        Order.create!(
          customer: customer, product: product,
          delivery_address: delivery_address,
          delivery_date: base_date + 4.days,
          price: product.price, status: "ordered",
          ordered_at: base_date
        )
      end

      it "4/1 の在庫推移を正しく計算する" do
        result = service.forecast(item, base_date, base_date + 6.days)
        day1 = result[0] # 4/1
        expect(day1[:date]).to eq(base_date)
        expect(day1[:available_stock]).to eq(30)
        expect(day1[:incoming]).to eq(0)
        expect(day1[:allocated]).to eq(0)
        expect(day1[:expired]).to eq(0)
        expect(day1[:effective_stock]).to eq(30)
      end

      it "出荷日に引当が反映される" do
        result = service.forecast(item, base_date, base_date + 6.days)
        # 注文1: 届け日 4/3(base+2) → 出荷日 4/2(base+1)
        day2 = result[1] # 4/2
        expect(day2[:allocated]).to eq(5)
        # 注文2: 届け日 4/5(base+4) → 出荷日 4/4(base+3)
        day4 = result[3] # 4/4
        expect(day4[:allocated]).to eq(5)
      end

      it "日付と各値のハッシュ構造を返す" do
        result = service.forecast(item, base_date, base_date + 2.days)
        expect(result.first).to include(
          :date, :available_stock, :incoming, :allocated, :expired, :effective_stock
        )
      end
    end
  end
end
