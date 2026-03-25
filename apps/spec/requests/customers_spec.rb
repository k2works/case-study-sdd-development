require "rails_helper"

RSpec.describe "Customers (得意先管理)", type: :request do
  let(:staff_user) { create(:user, :staff) }
  let(:customer_user) { create(:user, role: "customer") }
  let!(:customer) { create(:customer, user: customer_user, name: "田中太郎", phone: "090-1234-5678") }

  describe "未認証の場合" do
    it "ログインページにリダイレクトされる" do
      get customers_path
      expect(response).to redirect_to(new_user_session_path)
    end
  end

  describe "認証済みスタッフの場合" do
    before { sign_in staff_user }

    describe "GET /customers" do
      it "得意先一覧を表示する" do
        get customers_path
        expect(response).to have_http_status(:ok)
        expect(response.body).to include("田中太郎")
      end

      it "得意先がない場合はガイダンスを表示する" do
        customer.destroy
        get customers_path
        expect(response).to have_http_status(:ok)
        expect(response.body).to include("得意先はまだ登録されていません")
      end
    end

    describe "GET /customers/:id/edit" do
      it "編集画面を表示する" do
        get edit_customer_path(customer)
        expect(response).to have_http_status(:ok)
        expect(response.body).to include("田中太郎")
      end
    end

    describe "PATCH /customers/:id" do
      it "正常なデータで更新が成功する" do
        patch customer_path(customer), params: { customer: { name: "田中次郎", phone: "080-9999-0000" } }
        expect(response).to redirect_to(customers_path)
        expect(customer.reload.name).to eq("田中次郎")
        expect(customer.reload.phone).to eq("080-9999-0000")
      end

      it "名前が空の場合はエラーを表示する" do
        patch customer_path(customer), params: { customer: { name: "", phone: "080-9999-0000" } }
        expect(response).to have_http_status(:unprocessable_entity)
      end
    end
  end
end
