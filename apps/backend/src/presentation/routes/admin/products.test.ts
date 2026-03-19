import { describe, it, expect, vi, beforeEach } from 'vitest'
import { buildApp } from '../../../server.js'
import { Product } from '../../../domain/product/Product.js'
import type { ProductService } from '../../../application/product/ProductService.js'

const sampleProduct = Product.reconstruct({
  id: 1,
  name: 'バラの花束',
  price: 3000,
  compositions: [{ itemId: 1, quantity: 3 }],
  isActive: true,
})

const mockService = {
  getAll: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
} as unknown as ProductService

describe('Admin Products API', () => {
  let app: ReturnType<typeof buildApp>

  beforeEach(() => {
    vi.clearAllMocks()
    app = buildApp({ productService: mockService })
  })

  it('GET /api/admin/products → 200 + 一覧', async () => {
    vi.mocked(mockService.getAll).mockResolvedValue([sampleProduct])
    const res = await app.inject({ method: 'GET', url: '/api/admin/products' })
    expect(res.statusCode).toBe(200)
    expect(res.json()).toHaveLength(1)
  })

  it('POST /api/admin/products → 201 + 登録済み商品', async () => {
    vi.mocked(mockService.create).mockResolvedValue(sampleProduct)
    const res = await app.inject({
      method: 'POST',
      url: '/api/admin/products',
      payload: { name: 'バラの花束', price: 3000, compositions: [{ itemId: 1, quantity: 3 }] },
    })
    expect(res.statusCode).toBe(201)
    expect(res.json().name).toBe('バラの花束')
  })

  it('PUT /api/admin/products/:id → 200 + 更新済み商品', async () => {
    vi.mocked(mockService.update).mockResolvedValue(sampleProduct)
    const res = await app.inject({
      method: 'PUT',
      url: '/api/admin/products/1',
      payload: { name: 'バラの花束', price: 3000, compositions: [{ itemId: 1, quantity: 3 }] },
    })
    expect(res.statusCode).toBe(200)
  })

  it('DELETE /api/admin/products/:id → 204', async () => {
    vi.mocked(mockService.delete).mockResolvedValue(undefined)
    const res = await app.inject({ method: 'DELETE', url: '/api/admin/products/1' })
    expect(res.statusCode).toBe(204)
  })

  it('POST: 不正なデータ → 400', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/admin/products',
      payload: { name: '', price: -1, compositions: [] },
    })
    expect(res.statusCode).toBe(400)
  })
})
