require "rails_helper"

RSpec.describe "Items", type: :request do
  let(:staff_user) { create(:user, :staff) }
  let(:supplier) { create(:supplier) }

  before { sign_in staff_user }

  describe "GET /items" do
    it "単品一覧を表示する" do
      create(:item, name: "バラ（赤）", supplier: supplier)
      get items_path
      expect(response).to have_http_status(:ok)
      expect(response.body).to include("バラ（赤）")
    end
  end

  describe "GET /items/new" do
    it "新規登録フォームを表示する" do
      get new_item_path
      expect(response).to have_http_status(:ok)
    end
  end

  describe "POST /items" do
    context "有効なパラメータの場合" do
      it "単品を登録できる" do
        expect {
          post items_path, params: { item: {
            name: "カーネーション", quality_retention_days: 7,
            purchase_unit: 10, lead_time_days: 2, supplier_id: supplier.id
          } }
        }.to change(Item, :count).by(1)
        expect(response).to redirect_to(items_path)
      end
    end

    context "無効なパラメータの場合" do
      it "名前が空の場合はエラーを表示する" do
        post items_path, params: { item: {
          name: "", quality_retention_days: 5, purchase_unit: 10,
          lead_time_days: 3, supplier_id: supplier.id
        } }
        expect(response).to have_http_status(:unprocessable_entity)
      end
    end
  end

  describe "PATCH /items/:id" do
    it "単品を更新できる" do
      item = create(:item, supplier: supplier)
      patch item_path(item), params: { item: { name: "バラ（白）" } }
      expect(response).to redirect_to(items_path)
      expect(item.reload.name).to eq("バラ（白）")
    end
  end
end
