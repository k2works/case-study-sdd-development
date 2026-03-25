class CreateArrivals < ActiveRecord::Migration[7.2]
  def change
    create_table :arrivals do |t|
      t.references :purchase_order, null: false, foreign_key: true, index: false
      t.references :item, null: false, foreign_key: true
      t.integer :quantity, null: false
      t.datetime :arrived_at, null: false

      t.timestamps
    end

    add_index :arrivals, :purchase_order_id, unique: true
  end
end
