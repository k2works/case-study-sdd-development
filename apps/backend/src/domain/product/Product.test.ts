import { describe, it, expect } from 'vitest'
import { Product, ProductComposition } from './Product.js'

describe('Product', () => {
  const validCompositions: ProductComposition[] = [
    { itemId: 1, quantity: 3 },
    { itemId: 2, quantity: 5 },
  ]

  it('有効なデータで生成できる', () => {
    const product = Product.create({ name: 'バラの花束', price: 3000, compositions: validCompositions })
    expect(product.name).toBe('バラの花束')
    expect(product.price).toBe(3000)
    expect(product.isActive).toBe(true)
  })

  it('価格が0以下の場合エラー', () => {
    expect(() =>
      Product.create({ name: 'バラの花束', price: 0, compositions: validCompositions })
    ).toThrow('価格は1以上である必要があります')
  })

  it('名前が空の場合エラー', () => {
    expect(() =>
      Product.create({ name: '', price: 3000, compositions: validCompositions })
    ).toThrow('商品名は必須です')
  })

  it('構成が空の場合エラー', () => {
    expect(() =>
      Product.create({ name: 'バラの花束', price: 3000, compositions: [] })
    ).toThrow('商品構成は1つ以上必要です')
  })

  it('deactivate で非アクティブになる', () => {
    const product = Product.create({ name: 'バラの花束', price: 3000, compositions: validCompositions })
    const deactivated = product.deactivate()
    expect(deactivated.isActive).toBe(false)
  })

  it('update で名前と価格を更新できる', () => {
    const product = Product.create({ name: 'バラの花束', price: 3000, compositions: validCompositions })
    const updated = product.update({ name: '豪華バラの花束', price: 5000, compositions: validCompositions })
    expect(updated.name).toBe('豪華バラの花束')
    expect(updated.price).toBe(5000)
  })
})
