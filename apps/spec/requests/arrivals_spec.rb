require "rails_helper"

RSpec.describe "Arrivals", type: :request do
  let(:staff_user) { create(:user, :staff) }
  let(:supplier) { create(:supplier) }
  let(:item) { create(:item, supplier: supplier, purchase_unit: 10, lead_time_days: 3, quality_retention_days: 5) }

  describe "未認証の場合" do
    it "ログインページにリダイレクトされる" do
      po = create(:purchase_order, item: item, supplier: supplier)
      get new_purchase_order_arrival_path(po)
      expect(response).to redirect_to(new_user_session_path)
    end
  end

  describe "認証済みスタッフの場合" do
    before { sign_in staff_user }

    describe "GET /purchase_orders/:id/arrivals/new" do
      it "入荷受入フォームを表示する" do
        po = create(:purchase_order, item: item, supplier: supplier, status: "ordered")
        get new_purchase_order_arrival_path(po)
        expect(response).to have_http_status(:ok)
        expect(response.body).to include(item.name)
      end
    end

    describe "POST /purchase_orders/:id/arrivals" do
      let!(:po) { create(:purchase_order, item: item, supplier: supplier, status: "ordered", quantity: 10) }

      context "有効なパラメータの場合" do
        it "入荷を記録できる" do
          expect {
            post purchase_order_arrivals_path(po), params: { arrival: {
              quantity: 10, arrived_at: Date.current.to_s
            } }
          }.to change(Arrival, :count).by(1).and change(Stock, :count).by(1)
          expect(response).to redirect_to(purchase_order_path(po))
        end

        it "発注ステータスが入荷済みに更新される" do
          post purchase_order_arrivals_path(po), params: { arrival: {
            quantity: 10, arrived_at: Date.current.to_s
          } }
          expect(po.reload).to be_arrived
        end
      end

      context "入荷済みの発注の場合" do
        it "エラーを表示する" do
          po.update!(status: :arrived)
          post purchase_order_arrivals_path(po), params: { arrival: {
            quantity: 10, arrived_at: Date.current.to_s
          } }
          expect(response).to have_http_status(:unprocessable_entity)
        end
      end
    end
  end
end
