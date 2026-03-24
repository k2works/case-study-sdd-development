Rails.application.routes.draw do
  devise_for :users

  # スタッフ向け管理画面
  resources :products, except: [ :show, :destroy ] do
    resources :compositions, only: [ :index, :create, :destroy ]
  end
  resources :items, except: [ :show, :destroy ]
  resources :orders, only: [ :index, :show ]
  resources :stock_forecasts, only: [ :index ]
  resources :purchase_orders, only: [ :index, :new, :create, :show ] do
    resources :arrivals, only: [ :new, :create ]
  end
  resources :shipments, only: [ :index, :create ]

  # 得意先向けショップ
  get "shop", to: "shop#index", as: :shop
  namespace :shop do
    resources :orders, only: [ :new, :create ] do
      collection do
        post :confirm
        get :complete
      end
    end
  end

  get "up" => "rails/health#show", as: :rails_health_check
  get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker
  get "manifest" => "rails/pwa#manifest", as: :pwa_manifest

  root "products#index"
end
