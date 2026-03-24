class CreateOrders < ActiveRecord::Migration[7.2]
  def change
    create_table :orders do |t|
      t.references :customer, null: false, foreign_key: true
      t.references :product, null: false, foreign_key: true
      t.references :delivery_address, null: false, foreign_key: true
      t.date :delivery_date, null: false
      t.text :message
      t.integer :price, null: false
      t.string :status, null: false, default: "ordered"
      t.datetime :ordered_at, null: false

      t.timestamps
    end

    add_index :orders, :delivery_date
    add_index :orders, :status
  end
end
