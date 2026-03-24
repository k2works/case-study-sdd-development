require "rails_helper"

RSpec.describe Product, type: :model do
  describe "ファクトリ" do
    it "有効なファクトリを持つ" do
      expect(build(:product)).to be_valid
    end
  end

  describe "バリデーション" do
    subject { build(:product) }

    it { is_expected.to validate_presence_of(:name) }
    it { is_expected.to validate_presence_of(:price) }
    it { is_expected.to validate_numericality_of(:price).is_greater_than(0) }
  end

  describe "関連" do
    it { is_expected.to have_many(:compositions).dependent(:destroy) }
    it { is_expected.to have_many(:items).through(:compositions) }
  end

  describe "デフォルト値" do
    it "active のデフォルト値が true である" do
      product = Product.new(name: "テスト", price: 1000)
      expect(product.active).to be true
    end
  end
end
