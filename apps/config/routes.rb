Rails.application.routes.draw do
  devise_for :users

  resources :products, except: [ :show, :destroy ] do
    resources :compositions, only: [ :index, :create, :destroy ]
  end
  resources :items, except: [ :show, :destroy ]

  get "up" => "rails/health#show", as: :rails_health_check
  get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker
  get "manifest" => "rails/pwa#manifest", as: :pwa_manifest

  root "products#index"
end
