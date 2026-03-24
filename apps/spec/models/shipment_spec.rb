require "rails_helper"

RSpec.describe Shipment, type: :model do
  describe "関連" do
    it { is_expected.to belong_to(:order) }
  end

  describe "バリデーション" do
    it { is_expected.to validate_presence_of(:shipped_at) }

    it "同一受注に対して重複出荷できない" do
      customer_user = create(:user, role: "customer")
      customer = create(:customer, user: customer_user)
      product = create(:product)
      delivery_address = create(:delivery_address, customer: customer)
      order = create(:order, customer: customer, product: product, delivery_address: delivery_address)
      Shipment.create!(order: order, shipped_at: Time.current)
      duplicate = Shipment.new(order: order, shipped_at: Time.current)
      expect(duplicate).not_to be_valid
    end
  end
end
