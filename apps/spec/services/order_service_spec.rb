require "rails_helper"

RSpec.describe OrderService, type: :service do
  let(:service) { OrderService.new(current_date: Date.new(2026, 4, 1)) }
  let(:customer) { create(:customer) }
  let(:product) { create(:product) }
  let(:delivery_address) { create(:delivery_address, customer: customer) }

  let(:ordered_order) do
    create(:order, customer: customer, product: product, delivery_address: delivery_address,
           status: :ordered, delivery_date: Date.new(2026, 4, 15))
  end

  describe "#change_delivery_date" do
    it "正常な届け日変更ができる" do
      new_date = Date.new(2026, 4, 20)
      service.change_delivery_date(order: ordered_order, new_date: new_date)
      expect(ordered_order.reload.delivery_date).to eq(new_date)
    end

    it "shipped 状態の注文は変更不可" do
      shipped_order = create(:order, customer: customer, product: product,
                             delivery_address: delivery_address, status: :shipped,
                             delivery_date: Date.new(2026, 4, 15))
      expect {
        service.change_delivery_date(order: shipped_order, new_date: Date.new(2026, 4, 20))
      }.to raise_error(Order::NotModifiableError)
    end

    it "cancelled 状態の注文は変更不可" do
      cancelled_order = create(:order, customer: customer, product: product,
                               delivery_address: delivery_address, status: :cancelled,
                               delivery_date: Date.new(2026, 4, 15))
      expect {
        service.change_delivery_date(order: cancelled_order, new_date: Date.new(2026, 4, 20))
      }.to raise_error(Order::NotModifiableError)
    end

    it "過去日への変更は不可" do
      expect {
        service.change_delivery_date(order: ordered_order, new_date: Date.yesterday)
      }.to raise_error(Order::InvalidDateError)
    end

    it "トランザクション内で実行される" do
      allow(ordered_order).to receive(:change_delivery_date!).and_raise(ActiveRecord::RecordInvalid)
      expect {
        service.change_delivery_date(order: ordered_order, new_date: Date.new(2026, 4, 20))
      }.to raise_error(ActiveRecord::RecordInvalid)
    end
  end

  describe "#cancel" do
    it "ordered 状態の注文をキャンセルできる" do
      service.cancel(order: ordered_order)
      expect(ordered_order.reload.cancelled?).to be true
    end

    it "shipped 状態の注文はキャンセル不可" do
      shipped_order = create(:order, customer: customer, product: product,
                             delivery_address: delivery_address, status: :shipped,
                             delivery_date: Date.new(2026, 4, 15))
      expect {
        service.cancel(order: shipped_order)
      }.to raise_error(Order::NotModifiableError)
    end

    it "キャンセル後の注文は在庫推移の引当対象から外れる" do
      service.cancel(order: ordered_order)
      expect(ordered_order.reload.status).to eq("cancelled")
    end
  end
end
