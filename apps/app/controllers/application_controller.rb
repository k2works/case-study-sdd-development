class ApplicationController < ActionController::Base
  allow_browser versions: :modern

  private

  def require_staff!
    unless current_user&.staff?
      redirect_to root_path, alert: "権限がありません"
    end
  end
end
