require "rails_helper"

RSpec.describe Arrival, type: :model do
  describe "関連" do
    it { is_expected.to belong_to(:purchase_order) }
    it { is_expected.to belong_to(:item) }
  end

  describe "バリデーション" do
    it { is_expected.to validate_presence_of(:quantity) }
    it { is_expected.to validate_numericality_of(:quantity).is_greater_than(0) }
    it { is_expected.to validate_presence_of(:arrived_at) }

    it "同一発注に対して重複入荷できない" do
      supplier = create(:supplier)
      item = create(:item, supplier: supplier)
      po = PurchaseOrder.create!(
        item: item, supplier: supplier, quantity: 10,
        desired_delivery_date: 5.days.from_now.to_date,
        ordered_at: Time.current
      )
      Arrival.create!(purchase_order: po, item: item, quantity: 10, arrived_at: Time.current)
      duplicate = Arrival.new(purchase_order: po, item: item, quantity: 10, arrived_at: Time.current)
      expect(duplicate).not_to be_valid
    end
  end
end
