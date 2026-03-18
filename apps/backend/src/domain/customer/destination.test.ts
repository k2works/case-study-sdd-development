import { describe, it, expect } from 'vitest';
import { Destination } from './destination.js';
import { DestinationId, CustomerId } from '../shared/value-objects.js';

describe('Destination', () => {
  const validProps = {
    destinationId: new DestinationId(1),
    customerId: new CustomerId(1),
    name: '山田花子',
    address: '東京都渋谷区1-2-3',
    phone: '03-1111-2222',
  };

  it('正しいプロパティで生成できる', () => {
    const dest = new Destination(validProps);

    expect(dest.destinationId!.value).toBe(1);
    expect(dest.customerId.value).toBe(1);
    expect(dest.name).toBe('山田花子');
    expect(dest.address).toBe('東京都渋谷区1-2-3');
    expect(dest.phone).toBe('03-1111-2222');
  });

  it('createNew で新規届け先を作成できる', () => {
    const dest = Destination.createNew({
      customerId: new CustomerId(1),
      name: '佐藤次郎',
      address: '東京都新宿区4-5-6',
      phone: '03-3333-4444',
    });

    expect(dest.destinationId).toBeNull();
  });

  // 不変条件テスト
  it('名前が空の場合はエラー', () => {
    expect(() => new Destination({ ...validProps, name: '' })).toThrow('届け先名は1〜100文字');
  });

  it('名前が100文字の場合は正常', () => {
    const dest = new Destination({ ...validProps, name: 'あ'.repeat(100) });
    expect(dest.name.length).toBe(100);
  });

  it('名前が101文字の場合はエラー', () => {
    expect(() => new Destination({ ...validProps, name: 'あ'.repeat(101) })).toThrow('届け先名は1〜100文字');
  });

  it('住所が空の場合はエラー', () => {
    expect(() => new Destination({ ...validProps, address: '' })).toThrow('届け先住所は1〜255文字');
  });

  it('住所が255文字の場合は正常', () => {
    const dest = new Destination({ ...validProps, address: 'あ'.repeat(255) });
    expect(dest.address.length).toBe(255);
  });

  it('住所が256文字の場合はエラー', () => {
    expect(() => new Destination({ ...validProps, address: 'あ'.repeat(256) })).toThrow('届け先住所は1〜255文字');
  });

  it('電話番号が空の場合はエラー', () => {
    expect(() => new Destination({ ...validProps, phone: '' })).toThrow('届け先電話番号は1〜20文字');
  });

  it('電話番号が21文字の場合はエラー', () => {
    expect(() => new Destination({ ...validProps, phone: '0'.repeat(21) })).toThrow('届け先電話番号は1〜20文字');
  });

  // toSnapshot 変換
  it('DestinationSnapshot に変換できる', () => {
    const dest = new Destination(validProps);
    const snapshot = dest.toSnapshot();

    expect(snapshot.name).toBe('山田花子');
    expect(snapshot.address).toBe('東京都渋谷区1-2-3');
    expect(snapshot.phone).toBe('03-1111-2222');
  });
});
