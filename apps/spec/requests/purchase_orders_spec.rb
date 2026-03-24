require "rails_helper"

RSpec.describe "PurchaseOrders", type: :request do
  let(:staff_user) { create(:user, :staff) }
  let(:supplier) { create(:supplier) }
  let(:item) { create(:item, supplier: supplier, purchase_unit: 10, lead_time_days: 3) }

  describe "未認証の場合" do
    it "ログインページにリダイレクトされる" do
      get purchase_orders_path
      expect(response).to redirect_to(new_user_session_path)
    end
  end

  describe "認証済みスタッフの場合" do
    before { sign_in staff_user }

    describe "GET /purchase_orders" do
      it "発注一覧を表示する" do
        create(:purchase_order, item: item, supplier: supplier, quantity: 10)
        get purchase_orders_path
        expect(response).to have_http_status(:ok)
        expect(response.body).to include(item.name)
      end

      it "ステータスでフィルタリングできる" do
        create(:purchase_order, item: item, supplier: supplier, status: "ordered")
        create(:purchase_order, item: item, supplier: supplier, status: "arrived")
        get purchase_orders_path, params: { status: "ordered" }
        expect(response).to have_http_status(:ok)
      end

      it "発注がない場合は空状態メッセージを表示する" do
        get purchase_orders_path
        expect(response).to have_http_status(:ok)
        expect(response.body).to include("発注はまだありません")
      end
    end

    describe "GET /purchase_orders/new" do
      it "新規発注フォームを表示する" do
        get new_purchase_order_path
        expect(response).to have_http_status(:ok)
      end
    end

    describe "POST /purchase_orders" do
      context "有効なパラメータの場合" do
        it "発注を作成できる" do
          expect {
            post purchase_orders_path, params: { purchase_order: {
              item_id: item.id, quantity: 10,
              desired_delivery_date: 5.days.from_now.to_date.to_s
            } }
          }.to change(PurchaseOrder, :count).by(1)
          expect(response).to redirect_to(purchase_orders_path)
        end
      end

      context "無効なパラメータの場合" do
        it "購入単位の整数倍でない場合はエラーを表示する" do
          post purchase_orders_path, params: { purchase_order: {
            item_id: item.id, quantity: 15,
            desired_delivery_date: 5.days.from_now.to_date.to_s
          } }
          expect(response).to have_http_status(:unprocessable_entity)
        end
      end
    end

    describe "GET /purchase_orders/:id" do
      it "発注詳細を表示する" do
        po = create(:purchase_order, item: item, supplier: supplier)
        get purchase_order_path(po)
        expect(response).to have_http_status(:ok)
        expect(response.body).to include(item.name)
      end
    end
  end
end
