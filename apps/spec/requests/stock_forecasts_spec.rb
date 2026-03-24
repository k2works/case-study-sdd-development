require "rails_helper"

RSpec.describe "StockForecasts (在庫推移)", type: :request do
  let(:staff_user) { create(:user, role: "staff") }
  let(:customer_user) { create(:user, role: "customer") }

  describe "未認証の場合" do
    it "ログインページにリダイレクトされる" do
      get stock_forecasts_path
      expect(response).to redirect_to(new_user_session_path)
    end
  end

  describe "得意先の場合" do
    before { sign_in customer_user }

    it "アクセスが拒否される" do
      get stock_forecasts_path
      expect(response).to redirect_to(root_path)
    end
  end

  describe "認証済みスタッフの場合" do
    let(:supplier) { create(:supplier) }
    let(:item1) { create(:item, name: "バラ（赤）", supplier: supplier, quality_retention_days: 5) }
    let(:item2) { create(:item, name: "カーネーション", supplier: supplier, quality_retention_days: 7) }

    before do
      sign_in staff_user
      item1
      item2
    end

    describe "GET /stock_forecasts" do
      it "在庫推移画面を表示する" do
        get stock_forecasts_path
        expect(response).to have_http_status(:ok)
        expect(response.body).to include("在庫推移")
      end

      it "単品一覧が表示される" do
        get stock_forecasts_path
        expect(response.body).to include("バラ（赤）")
        expect(response.body).to include("カーネーション")
      end
    end

    describe "GET /stock_forecasts?item_id=X" do
      before do
        Stock.create!(
          item: item1, quantity: 30,
          arrived_date: Date.current,
          expiry_date: Date.current + 5.days,
          status: "available"
        )
      end

      it "指定した単品の在庫推移を表示する" do
        get stock_forecasts_path, params: { item_id: item1.id }
        expect(response).to have_http_status(:ok)
        expect(response.body).to include("バラ（赤）")
        expect(response.body).to include("良品在庫")
        expect(response.body).to include("入荷予定")
        expect(response.body).to include("引当済み")
        expect(response.body).to include("廃棄対象")
        expect(response.body).to include("有効在庫")
      end

      it "期間を指定して在庫推移を表示する" do
        start_date = Date.current.to_s
        end_date = (Date.current + 7.days).to_s
        get stock_forecasts_path, params: {
          item_id: item1.id, start_date: start_date, end_date: end_date
        }
        expect(response).to have_http_status(:ok)
      end
    end
  end
end
