import { DestinationId, CustomerId } from '../shared/value-objects.js';
import { DestinationSnapshot } from '../order/destination-snapshot.js';

export interface DestinationProps {
  destinationId: DestinationId | null;
  customerId: CustomerId;
  name: string;
  address: string;
  phone: string;
}

export class Destination {
  readonly destinationId: DestinationId | null;
  readonly customerId: CustomerId;
  readonly name: string;
  readonly address: string;
  readonly phone: string;

  static createNew(props: Omit<DestinationProps, 'destinationId'>): Destination {
    return new Destination({ ...props, destinationId: null });
  }

  constructor(props: DestinationProps) {
    if (!props.name || props.name.length > 100) {
      throw new Error('届け先名は1〜100文字でなければなりません');
    }
    if (!props.address || props.address.length > 255) {
      throw new Error('届け先住所は1〜255文字でなければなりません');
    }
    if (!props.phone || props.phone.length > 20) {
      throw new Error('届け先電話番号は1〜20文字でなければなりません');
    }

    this.destinationId = props.destinationId;
    this.customerId = props.customerId;
    this.name = props.name;
    this.address = props.address;
    this.phone = props.phone;
  }

  toSnapshot(): DestinationSnapshot {
    return new DestinationSnapshot(this.name, this.address, this.phone);
  }
}
