class CreateCompositions < ActiveRecord::Migration[7.2]
  def change
    create_table :compositions do |t|
      t.references :product, null: false, foreign_key: true
      t.references :item, null: false, foreign_key: true
      t.integer :quantity, null: false

      t.timestamps
    end

    add_index :compositions, [ :product_id, :item_id ], unique: true
  end
end
