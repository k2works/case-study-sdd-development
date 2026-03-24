class CreateDeliveryAddresses < ActiveRecord::Migration[7.2]
  def change
    create_table :delivery_addresses do |t|
      t.references :customer, null: false, foreign_key: true
      t.string :recipient_name, null: false
      t.string :address, null: false
      t.string :phone, null: false

      t.timestamps
    end
  end
end
