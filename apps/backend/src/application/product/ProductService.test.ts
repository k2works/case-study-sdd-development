import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ProductService } from './ProductService.js'
import { Product } from '../../domain/product/Product.js'
import type { ProductRepository } from '../../domain/product/ProductRepository.js'

const mockRepo: ProductRepository = {
  findAll: vi.fn(),
  findById: vi.fn(),
  save: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
}

const sampleProduct = Product.reconstruct({
  id: 1,
  name: 'バラの花束',
  price: 3000,
  compositions: [{ itemId: 1, quantity: 3 }],
  isActive: true,
})

describe('ProductService', () => {
  let service: ProductService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new ProductService(mockRepo)
  })

  it('getAll: 商品一覧を返す', async () => {
    vi.mocked(mockRepo.findAll).mockResolvedValue([sampleProduct])
    const result = await service.getAll()
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('バラの花束')
  })

  it('create: 商品を登録して返す', async () => {
    vi.mocked(mockRepo.save).mockResolvedValue(sampleProduct)
    const result = await service.create({
      name: 'バラの花束',
      price: 3000,
      compositions: [{ itemId: 1, quantity: 3 }],
    })
    expect(result.name).toBe('バラの花束')
    expect(mockRepo.save).toHaveBeenCalledOnce()
  })

  it('update: 商品を更新して返す', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(sampleProduct)
    const updated = Product.reconstruct({ ...sampleProduct, name: '豪華バラ', id: 1 })
    vi.mocked(mockRepo.update).mockResolvedValue(updated)
    const result = await service.update(1, {
      name: '豪華バラ',
      price: 3000,
      compositions: [{ itemId: 1, quantity: 3 }],
    })
    expect(result.name).toBe('豪華バラ')
  })

  it('update: 存在しない商品はエラー', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(null)
    await expect(service.update(99, { name: 'x', price: 100, compositions: [{ itemId: 1, quantity: 1 }] }))
      .rejects.toThrow('商品が見つかりません')
  })

  it('delete: 商品を論理削除する', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(sampleProduct)
    const deactivated = sampleProduct.deactivate()
    vi.mocked(mockRepo.update).mockResolvedValue(deactivated)
    await service.delete(1)
    expect(mockRepo.update).toHaveBeenCalledWith(1, expect.objectContaining({ isActive: false }))
  })

  it('delete: 存在しない商品はエラー', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(null)
    await expect(service.delete(99)).rejects.toThrow('商品が見つかりません')
  })
})
