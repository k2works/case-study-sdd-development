require "rails_helper"

RSpec.describe "Orders (受注管理)", type: :request do
  let(:staff_user) { create(:user, :staff) }
  let(:customer_user) { create(:user, role: "customer") }
  let!(:customer) { create(:customer, user: customer_user) }
  let!(:product) { create(:product) }
  let!(:delivery_address) { create(:delivery_address, customer: customer) }

  describe "未認証の場合" do
    it "ログインページにリダイレクトされる" do
      get orders_path
      expect(response).to redirect_to(new_user_session_path)
    end
  end

  describe "認証済みスタッフの場合" do
    before { sign_in staff_user }

    describe "GET /orders" do
      it "受注一覧を表示する" do
        create(:order, customer: customer, product: product, delivery_address: delivery_address)
        get orders_path
        expect(response).to have_http_status(:ok)
      end

      it "届け日で絞り込みができる" do
        order = create(:order, customer: customer, product: product, delivery_address: delivery_address, delivery_date: 5.days.from_now.to_date)
        get orders_path, params: { delivery_date: order.delivery_date }
        expect(response).to have_http_status(:ok)
        expect(response.body).to include(product.name)
      end

      it "受注状態で絞り込みができる" do
        create(:order, customer: customer, product: product, delivery_address: delivery_address, status: "ordered")
        get orders_path, params: { status: "ordered" }
        expect(response).to have_http_status(:ok)
      end
    end

    describe "GET /orders/:id" do
      it "受注詳細を表示する" do
        order = create(:order, customer: customer, product: product, delivery_address: delivery_address)
        get order_path(order)
        expect(response).to have_http_status(:ok)
        expect(response.body).to include(product.name)
      end
    end
  end
end
