import { describe, it, expect } from 'vitest'
import { Item } from './Item.js'

describe('Item', () => {
  it('有効なデータで生成できる', () => {
    const item = Item.create({ name: 'バラ（赤）', supplierId: 1, shelfLife: 7 })
    expect(item.name).toBe('バラ（赤）')
    expect(item.shelfLife).toBe(7)
    expect(item.isActive).toBe(true)
  })

  it('名前が空の場合エラー', () => {
    expect(() => Item.create({ name: '', supplierId: 1, shelfLife: 7 }))
      .toThrow('単品名は必須です')
  })

  it('品質維持日数が0以下の場合エラー', () => {
    expect(() => Item.create({ name: 'バラ', supplierId: 1, shelfLife: 0 }))
      .toThrow('品質維持日数は1以上である必要があります')
  })

  it('deactivate で非アクティブになる', () => {
    const item = Item.create({ name: 'バラ（赤）', supplierId: 1, shelfLife: 7 })
    expect(item.deactivate().isActive).toBe(false)
  })
})
