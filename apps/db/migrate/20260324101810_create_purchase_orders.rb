class CreatePurchaseOrders < ActiveRecord::Migration[7.2]
  def change
    create_table :purchase_orders do |t|
      t.references :item, null: false, foreign_key: true
      t.references :supplier, null: false, foreign_key: true
      t.integer :quantity, null: false
      t.date :desired_delivery_date, null: false
      t.string :status, null: false, default: "ordered"
      t.datetime :ordered_at, null: false

      t.timestamps
    end

    add_index :purchase_orders, :status
  end
end
