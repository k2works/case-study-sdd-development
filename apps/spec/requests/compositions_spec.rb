require "rails_helper"

RSpec.describe "Compositions", type: :request do
  let(:staff_user) { create(:user, :staff) }
  let(:product) { create(:product) }
  let(:item) { create(:item) }

  before { sign_in staff_user }

  describe "GET /products/:product_id/compositions" do
    it "花束構成一覧を表示する" do
      create(:composition, product: product, item: item, quantity: 5)
      get product_compositions_path(product)
      expect(response).to have_http_status(:ok)
      expect(response.body).to include(item.name)
    end
  end

  describe "POST /products/:product_id/compositions" do
    it "構成を追加できる" do
      expect {
        post product_compositions_path(product), params: {
          composition: { item_id: item.id, quantity: 3 }
        }
      }.to change(Composition, :count).by(1)
      expect(response).to redirect_to(product_compositions_path(product))
    end

    it "数量が0以下の場合はエラーを表示する" do
      post product_compositions_path(product), params: {
        composition: { item_id: item.id, quantity: 0 }
      }
      expect(response).to have_http_status(:unprocessable_entity)
    end
  end

  describe "DELETE /products/:product_id/compositions/:id" do
    it "構成を削除できる" do
      composition = create(:composition, product: product, item: item)
      expect {
        delete product_composition_path(product, composition)
      }.to change(Composition, :count).by(-1)
      expect(response).to redirect_to(product_compositions_path(product))
    end
  end
end
