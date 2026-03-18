import { describe, it, expect } from 'vitest';
import { DestinationSnapshot } from './destination-snapshot.js';

describe('DestinationSnapshot', () => {
  it('正しいプロパティで生成できる', () => {
    const dest = new DestinationSnapshot('田中太郎', '東京都渋谷区1-1-1', '03-1234-5678');

    expect(dest.name).toBe('田中太郎');
    expect(dest.address).toBe('東京都渋谷区1-1-1');
    expect(dest.phone).toBe('03-1234-5678');
  });

  it('名前が空の場合エラー', () => {
    expect(() => new DestinationSnapshot('', '東京都', '03-1234-5678')).toThrow();
  });

  it('名前が100文字を超える場合エラー', () => {
    expect(() => new DestinationSnapshot('あ'.repeat(101), '東京都', '03-1234-5678')).toThrow();
  });

  it('住所が空の場合エラー', () => {
    expect(() => new DestinationSnapshot('田中太郎', '', '03-1234-5678')).toThrow();
  });

  it('住所が255文字を超える場合エラー', () => {
    expect(() => new DestinationSnapshot('田中太郎', 'あ'.repeat(256), '03-1234-5678')).toThrow();
  });

  it('電話番号が空の場合エラー', () => {
    expect(() => new DestinationSnapshot('田中太郎', '東京都', '')).toThrow();
  });

  it('電話番号が20文字を超える場合エラー', () => {
    expect(() => new DestinationSnapshot('田中太郎', '東京都', '1'.repeat(21))).toThrow();
  });
});
