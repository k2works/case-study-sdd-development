import { ItemId, ItemName, Days, PurchaseUnit, SupplierId } from '../shared/value-objects.js';

export interface ItemProps {
  itemId: ItemId;
  name: ItemName;
  qualityRetentionDays: Days;
  purchaseUnit: PurchaseUnit;
  leadTimeDays: Days;
  supplierId: SupplierId;
}

export type NewItemProps = Omit<ItemProps, 'itemId'>;

export class Item {
  readonly itemId: ItemId;
  readonly name: ItemName;
  readonly qualityRetentionDays: Days;
  readonly purchaseUnit: PurchaseUnit;
  readonly leadTimeDays: Days;
  readonly supplierId: SupplierId;

  static createNew(props: NewItemProps): Item {
    return new Item({ ...props, itemId: undefined as unknown as ItemId });
  }

  constructor(props: ItemProps) {
    this.itemId = props.itemId;
    this.name = props.name;
    this.qualityRetentionDays = props.qualityRetentionDays;
    this.purchaseUnit = props.purchaseUnit;
    this.leadTimeDays = props.leadTimeDays;
    this.supplierId = props.supplierId;
  }

  changeName(name: ItemName): Item {
    return new Item({ ...this, name });
  }

  changeQualityRetentionDays(qualityRetentionDays: Days): Item {
    return new Item({ ...this, qualityRetentionDays });
  }

  changePurchaseUnit(purchaseUnit: PurchaseUnit): Item {
    return new Item({ ...this, purchaseUnit });
  }

  changeLeadTimeDays(leadTimeDays: Days): Item {
    return new Item({ ...this, leadTimeDays });
  }

  changeSupplierId(supplierId: SupplierId): Item {
    return new Item({ ...this, supplierId });
  }
}
