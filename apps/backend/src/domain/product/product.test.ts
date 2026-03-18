import { describe, it, expect } from 'vitest';
import { Product, ProductComposition } from './product.js';
import { ProductId, ProductName, Price, ItemId, Quantity } from '../shared/value-objects.js';

describe('ProductComposition', () => {
  it('単品IDと数量で生成できる', () => {
    const comp = new ProductComposition(new ItemId(1), new Quantity(3));
    expect(comp.itemId.value).toBe(1);
    expect(comp.quantity.value).toBe(3);
  });
});

describe('Product', () => {
  const createProduct = () =>
    new Product({
      productId: new ProductId(1),
      name: new ProductName('ローズブーケ'),
      price: new Price(5500),
      compositions: [
        new ProductComposition(new ItemId(1), new Quantity(5)),
        new ProductComposition(new ItemId(2), new Quantity(3)),
      ],
    });

  it('正しいプロパティで生成できる', () => {
    const product = createProduct();

    expect(product.productId.value).toBe(1);
    expect(product.name.value).toBe('ローズブーケ');
    expect(product.price.value).toBe(5500);
    expect(product.compositions).toHaveLength(2);
  });

  it('名前を変更できる', () => {
    const product = createProduct();
    const updated = product.changeName(new ProductName('スプリングミックス'));

    expect(updated.name.value).toBe('スプリングミックス');
    expect(product.name.value).toBe('ローズブーケ');
  });

  it('価格を変更できる', () => {
    const product = createProduct();
    const updated = product.changePrice(new Price(6000));

    expect(updated.price.value).toBe(6000);
  });

  it('構成を変更できる', () => {
    const product = createProduct();
    const newComps = [new ProductComposition(new ItemId(3), new Quantity(10))];
    const updated = product.changeCompositions(newComps);

    expect(updated.compositions).toHaveLength(1);
    expect(updated.compositions[0].itemId.value).toBe(3);
  });

  it('空の構成でも生成できる（新規作成時）', () => {
    const product = Product.createNew({
      name: new ProductName('テスト商品'),
      price: new Price(1000),
      compositions: [],
    });

    expect(product.compositions).toHaveLength(0);
  });
});
