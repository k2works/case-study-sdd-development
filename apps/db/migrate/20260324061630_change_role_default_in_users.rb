class ChangeRoleDefaultInUsers < ActiveRecord::Migration[7.2]
  def change
    change_column_default :users, :role, from: nil, to: "customer"
    change_column_null :users, :role, false, "customer"
  end
end
