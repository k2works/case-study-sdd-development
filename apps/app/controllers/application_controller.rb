class ApplicationController < ActionController::Base
  allow_browser versions: :modern

  # GitHub Codespaces プロキシで Origin ヘッダーが不一致になる問題を回避
  if Rails.env.development?
    self.forgery_protection_origin_check = false
  end

  private

  def require_staff!
    unless current_user&.staff?
      redirect_to shop_path, alert: "権限がありません"
    end
  end

  def after_sign_in_path_for(resource)
    return shop_path if resource.respond_to?(:customer?) && resource.customer?

    super
  end
end
