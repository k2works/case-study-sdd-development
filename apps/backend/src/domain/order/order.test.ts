import { describe, it, expect } from 'vitest';
import { Order } from './order.js';
import { OrderId, CustomerId, ProductId, Price, DeliveryDate, OrderStatus, Message } from '../shared/value-objects.js';
import { DestinationSnapshot } from './destination-snapshot.js';

describe('Order', () => {
  const createOrder = (overrides?: Partial<{
    orderId: OrderId;
    customerId: CustomerId;
    productId: ProductId;
    price: Price;
    destination: DestinationSnapshot;
    deliveryDate: DeliveryDate;
    message: Message;
    status: OrderStatus;
  }>) =>
    new Order({
      orderId: new OrderId(1),
      customerId: new CustomerId(10),
      productId: new ProductId(100),
      price: new Price(5500),
      destination: new DestinationSnapshot('田中太郎', '東京都渋谷区1-1-1', '03-1234-5678'),
      deliveryDate: new DeliveryDate(new Date('2026-04-01')),
      message: new Message('お誕生日おめでとうございます'),
      status: new OrderStatus('注文済み'),
      ...overrides,
    });

  it('正しいプロパティで生成できる', () => {
    const order = createOrder();

    expect(order.orderId.value).toBe(1);
    expect(order.customerId.value).toBe(10);
    expect(order.productId.value).toBe(100);
    expect(order.price.value).toBe(5500);
    expect(order.destination.name).toBe('田中太郎');
    expect(order.deliveryDate.value).toEqual(new Date('2026-04-01'));
    expect(order.message.value).toBe('お誕生日おめでとうございます');
    expect(order.status.value).toBe('注文済み');
  });

  it('shippingDate が deliveryDate - 1 日で自動計算される', () => {
    const order = createOrder();

    expect(order.shippingDate.value).toEqual(new Date('2026-03-31'));
  });

  it('createNew で新規注文を作成できる', () => {
    const order = Order.createNew({
      customerId: new CustomerId(10),
      productId: new ProductId(100),
      price: new Price(5500),
      destination: new DestinationSnapshot('田中太郎', '東京都渋谷区1-1-1', '03-1234-5678'),
      deliveryDate: new DeliveryDate(new Date('2026-04-01')),
      message: new Message('おめでとう'),
    });

    expect(order.orderId).toBeNull();
    expect(order.status.value).toBe('注文済み');
    expect(order.shippingDate.value).toEqual(new Date('2026-03-31'));
  });

  it('出荷準備中に遷移できる', () => {
    const order = createOrder();
    const prepared = order.prepareShipment();

    expect(prepared.status.value).toBe('出荷準備中');
  });

  it('出荷済みに遷移できる', () => {
    const order = createOrder().prepareShipment();
    const shipped = order.ship();

    expect(shipped.status.value).toBe('出荷済み');
  });

  it('キャンセルできる', () => {
    const order = createOrder();
    const cancelled = order.cancel();

    expect(cancelled.status.value).toBe('キャンセル');
  });

  it('出荷済みからキャンセルできない', () => {
    const order = createOrder().prepareShipment().ship();

    expect(() => order.cancel()).toThrow();
  });

  it('元のインスタンスは変更されない（イミュータブル）', () => {
    const order = createOrder();
    order.prepareShipment();

    expect(order.status.value).toBe('注文済み');
  });

  describe('不正な状態遷移', () => {
    it('出荷準備中から prepareShipment() はエラー', () => {
      const order = createOrder({ status: new OrderStatus('出荷準備中') });
      expect(() => order.prepareShipment()).toThrow();
    });

    it('出荷済みから prepareShipment() はエラー', () => {
      const order = createOrder({ status: new OrderStatus('出荷済み') });
      expect(() => order.prepareShipment()).toThrow();
    });

    it('出荷済みから ship() はエラー', () => {
      const order = createOrder({ status: new OrderStatus('出荷済み') });
      expect(() => order.ship()).toThrow();
    });

    it('注文済みから ship() はエラー（出荷準備中を経由しないと出荷できない）', () => {
      const order = createOrder({ status: new OrderStatus('注文済み') });
      expect(() => order.ship()).toThrow();
    });

    it('キャンセルから prepareShipment() はエラー', () => {
      const order = createOrder({ status: new OrderStatus('キャンセル') });
      expect(() => order.prepareShipment()).toThrow();
    });

    it('キャンセルから ship() はエラー', () => {
      const order = createOrder({ status: new OrderStatus('キャンセル') });
      expect(() => order.ship()).toThrow();
    });

    it('キャンセルから cancel() はエラー', () => {
      const order = createOrder({ status: new OrderStatus('キャンセル') });
      expect(() => order.cancel()).toThrow();
    });

    it('出荷準備中から cancel() はエラー', () => {
      const order = createOrder({ status: new OrderStatus('出荷準備中') });
      expect(() => order.cancel()).toThrow();
    });
  });
});
