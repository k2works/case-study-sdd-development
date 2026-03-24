require "rails_helper"

RSpec.describe "Products", type: :request do
  let(:staff_user) { create(:user, :staff) }

  before { sign_in staff_user }

  describe "GET /products" do
    it "商品一覧を表示する" do
      create(:product, name: "春のブーケ")
      get products_path
      expect(response).to have_http_status(:ok)
      expect(response.body).to include("春のブーケ")
    end
  end

  describe "GET /products/new" do
    it "新規登録フォームを表示する" do
      get new_product_path
      expect(response).to have_http_status(:ok)
    end
  end

  describe "POST /products" do
    context "有効なパラメータの場合" do
      it "商品を登録できる" do
        expect {
          post products_path, params: { product: { name: "テスト花束", description: "テスト説明", price: 3000 } }
        }.to change(Product, :count).by(1)
        expect(response).to redirect_to(products_path)
      end
    end

    context "無効なパラメータの場合" do
      it "商品名が空の場合はエラーを表示する" do
        post products_path, params: { product: { name: "", price: 3000 } }
        expect(response).to have_http_status(:unprocessable_entity)
      end

      it "価格が0以下の場合はエラーを表示する" do
        post products_path, params: { product: { name: "テスト", price: 0 } }
        expect(response).to have_http_status(:unprocessable_entity)
      end
    end
  end

  describe "GET /products/:id/edit" do
    it "編集フォームを表示する" do
      product = create(:product)
      get edit_product_path(product)
      expect(response).to have_http_status(:ok)
    end
  end

  describe "PATCH /products/:id" do
    it "商品を更新できる" do
      product = create(:product, name: "旧名前")
      patch product_path(product), params: { product: { name: "新名前" } }
      expect(response).to redirect_to(products_path)
      expect(product.reload.name).to eq("新名前")
    end
  end
end
