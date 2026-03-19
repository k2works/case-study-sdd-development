import Fastify from 'fastify'
import { z } from 'zod'
import type { ProductService } from './application/product/ProductService.js'
import type { ItemService } from './application/item/ItemService.js'

const productInputSchema = z.object({
  name: z.string().min(1),
  price: z.number().int().positive(),
  compositions: z.array(z.object({ itemId: z.number().int().positive(), quantity: z.number().int().positive() })).min(1),
})

const itemInputSchema = z.object({
  name: z.string().min(1),
  supplierId: z.number().int().positive(),
  shelfLife: z.number().int().positive(),
})

type AppDeps = {
  productService?: ProductService
  itemService?: ItemService
}

export function buildApp(deps: AppDeps = {}) {
  const app = Fastify({ logger: false })

  app.get('/health', async () => ({ status: 'ok' }))

  if (deps.productService) {
    const svc = deps.productService
    app.get('/api/admin/products', async () => svc.getAll())
    app.post('/api/admin/products', async (req, reply) => {
      const parsed = productInputSchema.safeParse(req.body)
      if (!parsed.success) return reply.status(400).send({ error: parsed.error.flatten() })
      return reply.status(201).send(await svc.create(parsed.data))
    })
    app.put('/api/admin/products/:id', async (req, reply) => {
      const { id } = req.params as { id: string }
      const parsed = productInputSchema.safeParse(req.body)
      if (!parsed.success) return reply.status(400).send({ error: parsed.error.flatten() })
      try { return reply.send(await svc.update(Number(id), parsed.data)) }
      catch { return reply.status(404).send({ error: '商品が見つかりません' }) }
    })
    app.delete('/api/admin/products/:id', async (req, reply) => {
      const { id } = req.params as { id: string }
      try { await svc.delete(Number(id)); return reply.status(204).send() }
      catch { return reply.status(404).send({ error: '商品が見つかりません' }) }
    })
  }

  if (deps.itemService) {
    const svc = deps.itemService
    app.get('/api/admin/items', async () => svc.getAll())
    app.post('/api/admin/items', async (req, reply) => {
      const parsed = itemInputSchema.safeParse(req.body)
      if (!parsed.success) return reply.status(400).send({ error: parsed.error.flatten() })
      return reply.status(201).send(await svc.create(parsed.data))
    })
    app.put('/api/admin/items/:id', async (req, reply) => {
      const { id } = req.params as { id: string }
      const parsed = itemInputSchema.safeParse(req.body)
      if (!parsed.success) return reply.status(400).send({ error: parsed.error.flatten() })
      try { return reply.send(await svc.update(Number(id), parsed.data)) }
      catch { return reply.status(404).send({ error: '単品が見つかりません' }) }
    })
    app.delete('/api/admin/items/:id', async (req, reply) => {
      const { id } = req.params as { id: string }
      try { await svc.delete(Number(id)); return reply.status(204).send() }
      catch { return reply.status(404).send({ error: '単品が見つかりません' }) }
    })
  }

  return app
}
