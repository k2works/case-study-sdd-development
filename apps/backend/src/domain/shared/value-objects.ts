export class ItemId {
  constructor(public readonly value: number) {
    if (value <= 0) throw new Error('ItemId は正の整数でなければなりません');
  }

  equals(other: ItemId): boolean {
    return this.value === other.value;
  }
}

export class ItemName {
  constructor(public readonly value: string) {
    if (value.length === 0) throw new Error('ItemName は空にできません');
    if (value.length > 100) throw new Error('ItemName は100文字以内でなければなりません');
  }
}

export class Days {
  constructor(public readonly value: number) {
    if (value < 0) throw new Error('Days は0以上でなければなりません');
  }
}

export class PurchaseUnit {
  constructor(public readonly value: number) {
    if (value <= 0) throw new Error('PurchaseUnit は正の整数でなければなりません');
  }
}

export class SupplierId {
  constructor(public readonly value: number) {
    if (value <= 0) throw new Error('SupplierId は正の整数でなければなりません');
  }
}
