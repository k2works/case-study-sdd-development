import { CustomerId } from '../shared/value-objects.js';

export interface CustomerProps {
  customerId: CustomerId | null;
  name: string;
  phone: string;
  email: string | null;
}

export class Customer {
  readonly customerId: CustomerId | null;
  readonly name: string;
  readonly phone: string;
  readonly email: string | null;

  static createNew(props: Omit<CustomerProps, 'customerId'>): Customer {
    return new Customer({ ...props, customerId: null });
  }

  constructor(props: CustomerProps) {
    if (!props.name || props.name.length > 100) {
      throw new Error('得意先名は1〜100文字でなければなりません');
    }
    if (!props.phone || props.phone.length > 20) {
      throw new Error('電話番号は1〜20文字でなければなりません');
    }
    if (props.email !== null && props.email !== undefined) {
      if (props.email.length === 0) {
        throw new Error('メールアドレスが空です');
      }
      if (props.email.length > 255) {
        throw new Error('メールアドレスは255文字以内でなければなりません');
      }
      if (!props.email.includes('@')) {
        throw new Error('メールアドレスの形式が不正です');
      }
    }

    this.customerId = props.customerId;
    this.name = props.name;
    this.phone = props.phone;
    this.email = props.email;
  }

  updateName(name: string): Customer {
    return new Customer({ ...this, name });
  }

  updatePhone(phone: string): Customer {
    return new Customer({ ...this, phone });
  }

  updateEmail(email: string | null): Customer {
    return new Customer({ ...this, email });
  }
}
