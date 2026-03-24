class CreateStocks < ActiveRecord::Migration[7.2]
  def change
    create_table :stocks do |t|
      t.references :item, null: false, foreign_key: true
      t.integer :quantity, null: false
      t.date :arrived_date, null: false
      t.date :expiry_date, null: false
      t.string :status, null: false, default: "available"

      t.timestamps
    end

    add_index :stocks, [ :item_id, :status ]
    add_index :stocks, :expiry_date
  end
end
