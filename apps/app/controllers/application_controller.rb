class ApplicationController < ActionController::Base
  allow_browser versions: :modern

  # GitHub Codespaces プロキシで Origin ヘッダーが不一致になる問題を回避
  if Rails.env.development?
    self.forgery_protection_origin_check = false
  end

  private

  def require_staff!
    unless current_user&.staff?
      redirect_to root_path, alert: "権限がありません"
    end
  end
end
