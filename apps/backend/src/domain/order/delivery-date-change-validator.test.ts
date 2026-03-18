import { describe, it, expect } from 'vitest';
import { DeliveryDateChangeValidator } from './delivery-date-change-validator.js';
import { Order } from './order.js';
import { OrderId, CustomerId, ProductId, Price, DeliveryDate, OrderStatus, Message } from '../shared/value-objects.js';
import { DestinationSnapshot } from './destination-snapshot.js';

describe('DeliveryDateChangeValidator', () => {
  const createOrder = (status: '注文済み' | '出荷準備中' | '出荷済み' | 'キャンセル' = '注文済み') =>
    new Order({
      orderId: new OrderId(1),
      customerId: new CustomerId(10),
      productId: new ProductId(100),
      price: new Price(5500),
      destination: new DestinationSnapshot('田中太郎', '東京都渋谷区1-1-1', '03-1234-5678'),
      deliveryDate: new DeliveryDate(new Date('2026-04-01')),
      message: new Message(''),
      status: new OrderStatus(status),
    });

  const futureDate = new DeliveryDate(new Date('2026-05-01'));

  describe('状態チェック', () => {
    it('注文済みの場合は変更可能', () => {
      const order = createOrder('注文済み');
      const result = DeliveryDateChangeValidator.validate(order, futureDate);

      expect(result.success).toBe(true);
    });

    it('出荷準備中の場合は変更不可', () => {
      const order = createOrder('出荷準備中');
      const result = DeliveryDateChangeValidator.validate(order, futureDate);

      expect(result.success).toBe(false);
      expect(result.reason).toContain('注文済み');
    });

    it('出荷済みの場合は変更不可', () => {
      const order = createOrder('出荷済み');
      const result = DeliveryDateChangeValidator.validate(order, futureDate);

      expect(result.success).toBe(false);
      expect(result.reason).toContain('注文済み');
    });

    it('キャンセルの場合は変更不可', () => {
      const order = createOrder('キャンセル');
      const result = DeliveryDateChangeValidator.validate(order, futureDate);

      expect(result.success).toBe(false);
      expect(result.reason).toContain('注文済み');
    });
  });

  describe('日付チェック', () => {
    it('新しい出荷日が過去の場合は変更不可', () => {
      const order = createOrder('注文済み');
      // 出荷日は届け日 - 1 日。届け日が今日以前だと出荷日は過去になる
      const pastDeliveryDate = new DeliveryDate(new Date('2026-03-18'), { skipValidation: true });
      const result = DeliveryDateChangeValidator.validate(order, pastDeliveryDate);

      expect(result.success).toBe(false);
      expect(result.reason).toContain('出荷日');
    });

    it('新しい出荷日が未来の場合は変更可能', () => {
      const order = createOrder('注文済み');
      const result = DeliveryDateChangeValidator.validate(order, futureDate);

      expect(result.success).toBe(true);
    });
  });
});
