require "rails_helper"

RSpec.describe ShippingService, type: :service do
  let(:base_date) { Date.new(2026, 5, 12) }
  let(:service) { described_class.new(current_date: base_date) }

  let(:customer_user) { create(:user, role: "customer") }
  let(:customer) { create(:customer, user: customer_user) }
  let(:supplier) { create(:supplier) }
  let(:item) { create(:item, supplier: supplier, quality_retention_days: 7) }
  let(:product) { create(:product) }
  let!(:composition) { create(:composition, product: product, item: item, quantity: 3) }
  let(:delivery_address) { create(:delivery_address, customer: customer) }

  # 届け日 = base_date + 1 → 出荷日 = base_date
  let!(:order) do
    create(:order,
      customer: customer,
      product: product,
      delivery_address: delivery_address,
      delivery_date: base_date + 1.day,
      status: "ordered"
    )
  end

  # 在庫を十分に用意（quantity: 10, item に対して available）
  let!(:stock) do
    create(:stock,
      item: item,
      quantity: 10,
      arrived_date: base_date - 3.days,
      expiry_date: base_date + 4.days,
      status: "available"
    )
  end

  describe "#ship" do
    context "正常な出荷の場合" do
      it "Shipment レコードが作成される" do
        expect {
          service.ship(order)
        }.to change(Shipment, :count).by(1)
      end

      it "Shipment を返す" do
        result = service.ship(order)
        expect(result).to be_a(Shipment)
        expect(result).to be_persisted
        expect(result.order).to eq(order)
        expect(result.shipped_at).to be_present
      end

      it "受注状態が shipped に更新される" do
        service.ship(order)
        expect(order.reload.status).to eq("shipped")
      end

      it "在庫が消費される（花束構成の数量分）" do
        service.ship(order)
        # composition.quantity = 3 なので在庫は 10 - 3 = 7
        expect(stock.reload.quantity).to eq(7)
      end
    end

    context "複数受注の一括出荷" do
      let!(:order2) do
        create(:order,
          customer: customer,
          product: product,
          delivery_address: delivery_address,
          delivery_date: base_date + 1.day,
          status: "ordered"
        )
      end

      it "複数の受注を一括出荷できる" do
        results = service.ship_all([order, order2])
        expect(results.size).to eq(2)
        expect(order.reload.status).to eq("shipped")
        expect(order2.reload.status).to eq("shipped")
        # 3 * 2 = 6 消費で 10 - 6 = 4
        expect(stock.reload.quantity).to eq(4)
      end
    end

    context "二重出荷防止" do
      it "出荷済みの受注を再出荷するとエラーになる" do
        service.ship(order)
        expect {
          service.ship(order)
        }.to raise_error(ShippingService::AlreadyShippedError)
      end
    end

    context "キャンセル済み受注" do
      it "キャンセル済みの受注を出荷するとエラーになる" do
        order.update!(status: "cancelled")
        expect {
          service.ship(order)
        }.to raise_error(ShippingService::InvalidStatusError)
      end
    end

    context "在庫不足の場合" do
      before { stock.update!(quantity: 1) }

      it "在庫不足でエラーになる" do
        expect {
          service.ship(order)
        }.to raise_error(ShippingService::InsufficientStockError)
      end

      it "トランザクションがロールバックされる" do
        expect {
          service.ship(order) rescue nil
        }.not_to change(Shipment, :count)
        expect(order.reload.status).to eq("ordered")
      end
    end
  end
end
