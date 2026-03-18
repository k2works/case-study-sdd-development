import { Order } from './order.js';
import { DeliveryDate, ShippingDate } from '../shared/value-objects.js';

export interface ValidationResult {
  success: boolean;
  reason?: string;
}

export class DeliveryDateChangeValidator {
  static validate(order: Order, newDeliveryDate: DeliveryDate): ValidationResult {
    // 状態チェック: 注文済み以外は不可
    if (order.status.value !== '注文済み') {
      return {
        success: false,
        reason: `届け日を変更できるのは「注文済み」の受注のみです（現在の状態: ${order.status.value}）`,
      };
    }

    // 日付チェック: 新しい出荷日が過去なら不可
    const newShippingDate = ShippingDate.fromDeliveryDate(newDeliveryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const shippingDateOnly = new Date(newShippingDate.value);
    shippingDateOnly.setHours(0, 0, 0, 0);

    if (shippingDateOnly <= today) {
      return {
        success: false,
        reason: `新しい出荷日（${shippingDateOnly.toISOString().split('T')[0]}）が過去または本日のため変更できません`,
      };
    }

    return { success: true };
  }
}
