require "rails_helper"

RSpec.describe DeliveryAddress, type: :model do
  describe "ファクトリ" do
    it "有効なファクトリを持つ" do
      expect(build(:delivery_address)).to be_valid
    end
  end

  describe "バリデーション" do
    it { is_expected.to validate_presence_of(:recipient_name) }
    it { is_expected.to validate_presence_of(:address) }
    it { is_expected.to validate_presence_of(:phone) }
  end

  describe "関連" do
    it { is_expected.to belong_to(:customer) }
  end

  describe ".for_customer" do
    let(:customer) { create(:customer) }
    let(:other_customer) { create(:customer) }

    it "指定した顧客の届け先一覧を返す" do
      addr1 = create(:delivery_address, customer: customer, recipient_name: "田中花子")
      create(:delivery_address, customer: other_customer, recipient_name: "別の人")
      result = DeliveryAddress.for_customer(customer)
      expect(result).to include(addr1)
      expect(result.size).to eq(1)
    end

    it "最新のものが先に表示される" do
      old = create(:delivery_address, customer: customer, recipient_name: "旧住所")
      new_addr = create(:delivery_address, customer: customer, recipient_name: "新住所")
      result = DeliveryAddress.for_customer(customer)
      expect(result.first).to eq(new_addr)
    end
  end
end
