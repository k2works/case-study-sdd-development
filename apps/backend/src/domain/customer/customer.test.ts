import { describe, it, expect } from 'vitest';
import { Customer } from './customer.js';
import { CustomerId } from '../shared/value-objects.js';

describe('Customer', () => {
  const validProps = {
    customerId: new CustomerId(1),
    name: '田中太郎',
    phone: '090-1234-5678',
    email: 'tanaka@example.com',
  };

  it('正しいプロパティで生成できる', () => {
    const customer = new Customer(validProps);

    expect(customer.customerId!.value).toBe(1);
    expect(customer.name).toBe('田中太郎');
    expect(customer.phone).toBe('090-1234-5678');
    expect(customer.email).toBe('tanaka@example.com');
  });

  it('createNew で新規得意先を作成できる', () => {
    const customer = Customer.createNew({
      name: '鈴木花子',
      phone: '090-8765-4321',
      email: null,
    });

    expect(customer.customerId).toBeNull();
    expect(customer.name).toBe('鈴木花子');
    expect(customer.email).toBeNull();
  });

  it('email が null でも作成できる', () => {
    const customer = new Customer({ ...validProps, email: null });
    expect(customer.email).toBeNull();
  });

  // 不変条件テスト: name
  it('名前が空の場合はエラー', () => {
    expect(() => new Customer({ ...validProps, name: '' })).toThrow('得意先名は1〜100文字');
  });

  it('名前が100文字の場合は正常', () => {
    const name = 'あ'.repeat(100);
    const customer = new Customer({ ...validProps, name });
    expect(customer.name).toBe(name);
  });

  it('名前が101文字の場合はエラー', () => {
    expect(() => new Customer({ ...validProps, name: 'あ'.repeat(101) })).toThrow('得意先名は1〜100文字');
  });

  // 不変条件テスト: phone
  it('電話番号が空の場合はエラー', () => {
    expect(() => new Customer({ ...validProps, phone: '' })).toThrow('電話番号は1〜20文字');
  });

  it('電話番号が20文字の場合は正常', () => {
    const phone = '0'.repeat(20);
    const customer = new Customer({ ...validProps, phone });
    expect(customer.phone).toBe(phone);
  });

  it('電話番号が21文字の場合はエラー', () => {
    expect(() => new Customer({ ...validProps, phone: '0'.repeat(21) })).toThrow('電話番号は1〜20文字');
  });

  // 不変条件テスト: email
  it('メールアドレスが空文字の場合はエラー', () => {
    expect(() => new Customer({ ...validProps, email: '' })).toThrow('メールアドレスが空です');
  });

  it('メールアドレスに @ がない場合はエラー', () => {
    expect(() => new Customer({ ...validProps, email: 'invalid' })).toThrow('メールアドレスの形式が不正');
  });

  it('メールアドレスが255文字を超える場合はエラー', () => {
    expect(() => new Customer({ ...validProps, email: 'a'.repeat(250) + '@b.com' })).toThrow('メールアドレスは255文字以内');
  });

  // 更新メソッド
  it('名前を更新できる', () => {
    const customer = new Customer(validProps);
    const updated = customer.updateName('佐藤次郎');

    expect(updated.name).toBe('佐藤次郎');
    expect(customer.name).toBe('田中太郎'); // イミュータブル
  });

  it('電話番号を更新できる', () => {
    const customer = new Customer(validProps);
    const updated = customer.updatePhone('03-1111-2222');

    expect(updated.phone).toBe('03-1111-2222');
  });

  it('メールアドレスを更新できる', () => {
    const customer = new Customer(validProps);
    const updated = customer.updateEmail('new@example.com');

    expect(updated.email).toBe('new@example.com');
  });

  it('メールアドレスを null に更新できる', () => {
    const customer = new Customer(validProps);
    const updated = customer.updateEmail(null);

    expect(updated.email).toBeNull();
  });
});
