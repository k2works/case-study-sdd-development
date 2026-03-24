class CreateShipments < ActiveRecord::Migration[7.2]
  def change
    create_table :shipments do |t|
      t.references :order, null: false, foreign_key: true, index: { unique: true }
      t.datetime :shipped_at, null: false

      t.timestamps
    end
  end
end
