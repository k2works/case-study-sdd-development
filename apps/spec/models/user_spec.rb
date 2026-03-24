require 'rails_helper'

RSpec.describe User, type: :model do
  describe "ファクトリ" do
    it "有効なファクトリを持つ" do
      expect(build(:user)).to be_valid
    end

    it "staff トレイトが有効" do
      user = build(:user, :staff)
      expect(user).to be_valid
      expect(user.role).to eq("staff")
    end
  end

  describe "バリデーション" do
    subject { build(:user) }

    it { is_expected.to validate_presence_of(:email) }
    it { is_expected.to validate_uniqueness_of(:email).case_insensitive }
    it { is_expected.to validate_presence_of(:role) }
    it { is_expected.to validate_inclusion_of(:role).in_array(User::ROLES) }
    it { is_expected.to validate_length_of(:name).is_at_most(100) }
  end

  describe "ロール判定" do
    it "customer? は customer ロールで true を返す" do
      user = build(:user, role: "customer")
      expect(user.customer?).to be true
      expect(user.staff?).to be false
    end

    it "staff? は staff ロールで true を返す" do
      user = build(:user, role: "staff")
      expect(user.staff?).to be true
      expect(user.customer?).to be false
    end
  end
end
