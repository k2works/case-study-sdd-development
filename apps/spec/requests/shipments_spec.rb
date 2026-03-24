require "rails_helper"

RSpec.describe "Shipments (出荷管理)", type: :request do
  let(:staff_user) { create(:user, :staff) }
  let(:customer_user) { create(:user, role: "customer") }
  let!(:customer) { create(:customer, user: customer_user) }
  let(:supplier) { create(:supplier) }
  let(:item) { create(:item, supplier: supplier, quality_retention_days: 7) }
  let!(:product) { create(:product) }
  let!(:composition) { create(:composition, product: product, item: item, quantity: 3) }
  let!(:delivery_address) { create(:delivery_address, customer: customer) }

  describe "未認証の場合" do
    it "ログインページにリダイレクトされる" do
      get shipments_path
      expect(response).to redirect_to(new_user_session_path)
    end
  end

  describe "認証済みスタッフの場合" do
    before { sign_in staff_user }

    describe "GET /shipments" do
      it "出荷一覧を表示する" do
        get shipments_path
        expect(response).to have_http_status(:ok)
      end

      it "出荷日で絞り込みができる" do
        shipping_date = Date.new(2026, 5, 14)
        delivery_date = shipping_date + 1.day
        order = create(:order, customer: customer, product: product,
                       delivery_address: delivery_address,
                       delivery_date: delivery_date, status: "ordered")

        get shipments_path, params: { shipping_date: shipping_date.to_s }
        expect(response).to have_http_status(:ok)
        expect(response.body).to include(product.name)
      end

      it "出荷済みの受注は表示されない" do
        shipping_date = Date.new(2026, 5, 14)
        delivery_date = shipping_date + 1.day
        create(:order, customer: customer, product: product,
               delivery_address: delivery_address,
               delivery_date: delivery_date, status: "shipped")

        get shipments_path, params: { shipping_date: shipping_date.to_s }
        expect(response).to have_http_status(:ok)
        expect(response.body).to include("出荷対象はありません")
      end
    end

    describe "POST /shipments" do
      let!(:stock) do
        create(:stock, item: item, quantity: 10,
               arrived_date: Date.current - 3.days,
               expiry_date: Date.current + 4.days,
               status: "available")
      end

      let!(:order) do
        create(:order, customer: customer, product: product,
               delivery_address: delivery_address,
               delivery_date: Date.tomorrow, status: "ordered")
      end

      context "有効なパラメータの場合" do
        it "出荷処理が実行される" do
          expect {
            post shipments_path, params: { order_ids: [order.id] }
          }.to change(Shipment, :count).by(1)
          expect(response).to redirect_to(shipments_path)
        end

        it "受注状態が出荷済みに更新される" do
          post shipments_path, params: { order_ids: [order.id] }
          expect(order.reload.status).to eq("shipped")
        end
      end

      context "出荷対象が選択されていない場合" do
        it "出荷一覧にリダイレクトされる" do
          post shipments_path, params: { order_ids: [] }
          expect(response).to redirect_to(shipments_path)
          expect(flash[:alert]).to be_present
        end
      end

      context "在庫不足の場合" do
        before { stock.update!(quantity: 0) }

        it "エラーを表示する" do
          post shipments_path, params: { order_ids: [order.id] }
          expect(response).to redirect_to(shipments_path)
          expect(flash[:alert]).to be_present
        end
      end
    end
  end
end
