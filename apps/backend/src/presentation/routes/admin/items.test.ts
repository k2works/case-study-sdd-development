import { describe, it, expect, vi, beforeEach } from 'vitest'
import { buildApp } from '../../../server.js'
import { Item } from '../../../domain/item/Item.js'
import type { ItemService } from '../../../application/item/ItemService.js'

const sample = Item.reconstruct({ id: 1, name: 'バラ（赤）', supplierId: 1, shelfLife: 7, isActive: true })
const mockService = { getAll: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() } as unknown as ItemService

describe('Admin Items API', () => {
  let app: ReturnType<typeof buildApp>

  beforeEach(() => {
    vi.clearAllMocks()
    app = buildApp({ itemService: mockService })
  })

  it('GET /api/admin/items → 200', async () => {
    vi.mocked(mockService.getAll).mockResolvedValue([sample])
    const res = await app.inject({ method: 'GET', url: '/api/admin/items' })
    expect(res.statusCode).toBe(200)
    expect(res.json()).toHaveLength(1)
  })

  it('POST /api/admin/items → 201', async () => {
    vi.mocked(mockService.create).mockResolvedValue(sample)
    const res = await app.inject({
      method: 'POST', url: '/api/admin/items',
      payload: { name: 'バラ（赤）', supplierId: 1, shelfLife: 7 },
    })
    expect(res.statusCode).toBe(201)
  })

  it('DELETE /api/admin/items/:id → 204', async () => {
    vi.mocked(mockService.delete).mockResolvedValue(undefined)
    const res = await app.inject({ method: 'DELETE', url: '/api/admin/items/1' })
    expect(res.statusCode).toBe(204)
  })
})
