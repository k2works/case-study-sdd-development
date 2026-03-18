import { OrderId, CustomerId, ProductId, Price, DeliveryDate, ShippingDate, OrderStatus, Message } from '../shared/value-objects.js';
import { DestinationSnapshot } from './destination-snapshot.js';

export interface OrderProps {
  orderId: OrderId | null;
  customerId: CustomerId;
  productId: ProductId;
  price: Price;
  destination: DestinationSnapshot;
  deliveryDate: DeliveryDate;
  message: Message;
  status: OrderStatus;
}

export type NewOrderProps = Omit<OrderProps, 'orderId' | 'status'>;

export class Order {
  readonly orderId: OrderId | null;
  readonly customerId: CustomerId;
  readonly productId: ProductId;
  readonly price: Price;
  readonly destination: DestinationSnapshot;
  readonly deliveryDate: DeliveryDate;
  readonly shippingDate: ShippingDate;
  readonly message: Message;
  readonly status: OrderStatus;

  static createNew(props: NewOrderProps): Order {
    return new Order({
      ...props,
      orderId: null,
      status: new OrderStatus('注文済み'),
    });
  }

  constructor(props: OrderProps) {
    this.orderId = props.orderId;
    this.customerId = props.customerId;
    this.productId = props.productId;
    this.price = props.price;
    this.destination = props.destination;
    this.deliveryDate = props.deliveryDate;
    this.shippingDate = ShippingDate.fromDeliveryDate(props.deliveryDate);
    this.message = props.message;
    this.status = props.status;
  }

  prepareShipment(): Order {
    if (this.status.value !== '注文済み') {
      throw new Error('注文済みの受注のみ出荷準備中に遷移できます');
    }
    return new Order({ ...this, status: new OrderStatus('出荷準備中') });
  }

  ship(): Order {
    if (this.status.value !== '出荷準備中') {
      throw new Error('出荷準備中の受注のみ出荷済みに遷移できます');
    }
    return new Order({ ...this, status: new OrderStatus('出荷済み') });
  }

  cancel(): Order {
    if (this.status.value !== '注文済み') {
      throw new Error('注文済みの受注のみキャンセルできます');
    }
    return new Order({ ...this, status: new OrderStatus('キャンセル') });
  }
}
