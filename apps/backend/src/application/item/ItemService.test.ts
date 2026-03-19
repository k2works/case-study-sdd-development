import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ItemService } from './ItemService.js'
import { Item } from '../../domain/item/Item.js'
import type { ItemRepository } from '../../domain/item/ItemRepository.js'

const mockRepo: ItemRepository = {
  findAll: vi.fn(),
  findById: vi.fn(),
  save: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
}

const sample = Item.reconstruct({ id: 1, name: 'バラ（赤）', supplierId: 1, shelfLife: 7, isActive: true })

describe('ItemService', () => {
  let service: ItemService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new ItemService(mockRepo)
  })

  it('getAll: 単品一覧を返す', async () => {
    vi.mocked(mockRepo.findAll).mockResolvedValue([sample])
    expect(await service.getAll()).toHaveLength(1)
  })

  it('create: 単品を登録して返す', async () => {
    vi.mocked(mockRepo.save).mockResolvedValue(sample)
    const result = await service.create({ name: 'バラ（赤）', supplierId: 1, shelfLife: 7 })
    expect(result.name).toBe('バラ（赤）')
  })

  it('update: 存在しない単品はエラー', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(null)
    await expect(service.update(99, { name: 'x', supplierId: 1, shelfLife: 1 }))
      .rejects.toThrow('単品が見つかりません')
  })

  it('delete: 論理削除する', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(sample)
    vi.mocked(mockRepo.update).mockResolvedValue(sample.deactivate())
    await service.delete(1)
    expect(mockRepo.update).toHaveBeenCalledWith(1, expect.objectContaining({ isActive: false }))
  })
})
