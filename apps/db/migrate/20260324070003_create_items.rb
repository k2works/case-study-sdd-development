class CreateItems < ActiveRecord::Migration[7.2]
  def change
    create_table :items do |t|
      t.string :name, null: false
      t.integer :quality_retention_days, null: false
      t.integer :purchase_unit, null: false
      t.integer :lead_time_days, null: false
      t.references :supplier, null: false, foreign_key: true

      t.timestamps
    end
  end
end
