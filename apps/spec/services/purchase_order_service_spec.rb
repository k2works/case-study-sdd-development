require "rails_helper"

RSpec.describe PurchaseOrderService, type: :service do
  let(:base_date) { Date.new(2026, 5, 12) }
  let(:service) { described_class.new(current_date: base_date) }
  let(:supplier) { create(:supplier) }
  let(:item) { create(:item, supplier: supplier, purchase_unit: 10, lead_time_days: 3) }

  describe "#create_order" do
    context "正常な発注の場合" do
      it "発注を作成できる" do
        result = service.create_order(item: item, quantity: 10, desired_delivery_date: base_date + 5.days)

        expect(result).to be_persisted
        expect(result).to be_a(PurchaseOrder)
      end

      it "仕入先が Item の supplier から自動設定される" do
        result = service.create_order(item: item, quantity: 10, desired_delivery_date: base_date + 5.days)

        expect(result.supplier).to eq(supplier)
      end

      it "ordered_at が現在日時で設定される" do
        result = service.create_order(item: item, quantity: 10, desired_delivery_date: base_date + 5.days)

        expect(result.ordered_at).to be_present
      end

      it "status が ordered で初期化される" do
        result = service.create_order(item: item, quantity: 10, desired_delivery_date: base_date + 5.days)

        expect(result).to be_ordered
      end
    end

    context "購入単位のバリデーション" do
      it "購入単位の整数倍の数量は受け付ける" do
        result = service.create_order(item: item, quantity: 20, desired_delivery_date: base_date + 5.days)

        expect(result).to be_persisted
      end

      it "購入単位の整数倍でない数量はエラーになる" do
        expect {
          service.create_order(item: item, quantity: 15, desired_delivery_date: base_date + 5.days)
        }.to raise_error(PurchaseOrderService::InvalidQuantityError)
      end

      it "数量が 0 の場合はエラーになる" do
        expect {
          service.create_order(item: item, quantity: 0, desired_delivery_date: base_date + 5.days)
        }.to raise_error(PurchaseOrderService::InvalidQuantityError)
      end

      it "購入単位が 1 の場合は任意の正の整数を受け付ける" do
        item_unit1 = create(:item, supplier: supplier, purchase_unit: 1, lead_time_days: 3)
        result = service.create_order(item: item_unit1, quantity: 7, desired_delivery_date: base_date + 5.days)

        expect(result).to be_persisted
      end
    end

    context "希望納品日のバリデーション" do
      it "過去日の場合はエラーになる" do
        expect {
          service.create_order(item: item, quantity: 10, desired_delivery_date: base_date - 1.day)
        }.to raise_error(PurchaseOrderService::InvalidDateError)
      end

      it "当日は受け付ける" do
        result = service.create_order(item: item, quantity: 10, desired_delivery_date: base_date)

        expect(result).to be_persisted
      end
    end
  end

  describe "#receive_arrival" do
    let!(:purchase_order) { create(:purchase_order, item: item, supplier: supplier, quantity: 10, status: "ordered") }

    context "正常な入荷の場合" do
      it "入荷を記録できる" do
        result = service.receive_arrival(purchase_order: purchase_order, quantity: 10, arrived_at: base_date)

        expect(result).to be_persisted
        expect(result).to be_a(Arrival)
      end

      it "入荷時に Stock レコードが作成される" do
        expect {
          service.receive_arrival(purchase_order: purchase_order, quantity: 10, arrived_at: base_date)
        }.to change(Stock, :count).by(1)
      end

      it "Stock の expiry_date が arrived_date + quality_retention_days で計算される" do
        service.receive_arrival(purchase_order: purchase_order, quantity: 10, arrived_at: base_date)

        stock = Stock.last
        expect(stock.arrived_date).to eq(base_date)
        expect(stock.expiry_date).to eq(base_date + item.quality_retention_days.days)
        expect(stock.quantity).to eq(10)
        expect(stock).to be_available
      end

      it "入荷時に PO の status が arrived に更新される" do
        service.receive_arrival(purchase_order: purchase_order, quantity: 10, arrived_at: base_date)

        expect(purchase_order.reload).to be_arrived
      end
    end

    context "異常な入荷の場合" do
      it "既に入荷済みの PO に対して入荷を記録するとエラーになる" do
        purchase_order.update!(status: :arrived)

        expect {
          service.receive_arrival(purchase_order: purchase_order, quantity: 10, arrived_at: base_date)
        }.to raise_error(PurchaseOrderService::InvalidStatusError)
      end

      it "キャンセル済みの PO に対して入荷を記録するとエラーになる" do
        purchase_order.update!(status: :cancelled)

        expect {
          service.receive_arrival(purchase_order: purchase_order, quantity: 10, arrived_at: base_date)
        }.to raise_error(PurchaseOrderService::InvalidStatusError)
      end
    end
  end
end
