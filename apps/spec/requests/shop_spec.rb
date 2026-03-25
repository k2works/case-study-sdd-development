require "rails_helper"

RSpec.describe "Shop (得意先向け)", type: :request do
  let(:customer_user) { create(:user, role: "customer") }
  let!(:customer) { create(:customer, user: customer_user) }
  let!(:product) { create(:product, name: "春のガーデンブーケ", price: 5500, active: true) }

  describe "未認証の場合" do
    it "ログインページにリダイレクトされる" do
      get shop_path
      expect(response).to redirect_to(new_user_session_path)
    end
  end

  describe "ログイン時の遷移" do
    let(:staff_user) { create(:user, role: "staff") }

    it "得意先はショップ画面に遷移する" do
      post user_session_path, params: { user: { email: customer_user.email, password: "password123" } }
      expect(response).to redirect_to(shop_path)
    end

    it "スタッフは管理画面に遷移する" do
      post user_session_path, params: { user: { email: staff_user.email, password: "password123" } }
      expect(response).to redirect_to(root_path)
    end
  end

  describe "認証済み得意先の場合" do
    before { sign_in customer_user }

    describe "GET /shop" do
      it "商品カタログを表示する" do
        get shop_path
        expect(response).to have_http_status(:ok)
        expect(response.body).to include("春のガーデンブーケ")
      end
    end

    describe "GET /shop/orders/new" do
      it "注文入力画面を表示する" do
        get new_shop_order_path(product_id: product.id)
        expect(response).to have_http_status(:ok)
      end

      it "確認画面遷移フォームは turbo を無効化する" do
        get new_shop_order_path(product_id: product.id)
        expect(response.body).to include('data-turbo="false"')
      end
    end

    describe "POST /shop/orders/confirm" do
      it "注文確認画面を表示する" do
        post confirm_shop_orders_path, params: {
          order: {
            product_id: product.id,
            delivery_date: 3.days.from_now.to_date,
            recipient_name: "山田花子",
            address: "東京都渋谷区",
            phone: "03-1234-5678",
            message: "お誕生日おめでとう"
          }
        }
        expect(response).to have_http_status(:ok)
      end
    end

    describe "POST /shop/orders" do
      it "注文を確定できる" do
        expect {
          post shop_orders_path, params: {
            order: {
              product_id: product.id,
              delivery_date: 3.days.from_now.to_date,
              recipient_name: "山田花子",
              address: "東京都渋谷区",
              phone: "03-1234-5678",
              message: "お誕生日おめでとう"
            }
          }
        }.to change(Order, :count).by(1)
        expect(response).to redirect_to(complete_shop_orders_path)
      end

      it "届け日が過去日の場合はエラーを表示する" do
        post shop_orders_path, params: {
          order: {
            product_id: product.id,
            delivery_date: Date.yesterday,
            recipient_name: "山田花子",
            address: "東京都渋谷区",
            phone: "03-1234-5678"
          }
        }
        expect(response).to have_http_status(:unprocessable_entity)
      end
    end

    describe "GET /shop/orders/complete" do
      it "注文完了画面を表示する" do
        get complete_shop_orders_path
        expect(response).to have_http_status(:ok)
      end
    end
  end
end
