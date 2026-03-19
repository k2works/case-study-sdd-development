import Fastify from 'fastify'
import { z } from 'zod'
import type { ProductService } from './application/product/ProductService.js'

const productInputSchema = z.object({
  name: z.string().min(1),
  price: z.number().int().positive(),
  compositions: z.array(z.object({ itemId: z.number().int().positive(), quantity: z.number().int().positive() })).min(1),
})

type AppDeps = {
  productService?: ProductService
}

export function buildApp(deps: AppDeps = {}) {
  const app = Fastify({ logger: false })

  app.get('/health', async () => ({ status: 'ok' }))

  if (deps.productService) {
    const svc = deps.productService

    // 管理者向け商品マスタ API
    app.get('/api/admin/products', async () => svc.getAll())

    app.post('/api/admin/products', async (req, reply) => {
      const parsed = productInputSchema.safeParse(req.body)
      if (!parsed.success) return reply.status(400).send({ error: parsed.error.flatten() })
      const product = await svc.create(parsed.data)
      return reply.status(201).send(product)
    })

    app.put('/api/admin/products/:id', async (req, reply) => {
      const { id } = req.params as { id: string }
      const parsed = productInputSchema.safeParse(req.body)
      if (!parsed.success) return reply.status(400).send({ error: parsed.error.flatten() })
      try {
        const product = await svc.update(Number(id), parsed.data)
        return reply.send(product)
      } catch {
        return reply.status(404).send({ error: '商品が見つかりません' })
      }
    })

    app.delete('/api/admin/products/:id', async (req, reply) => {
      const { id } = req.params as { id: string }
      try {
        await svc.delete(Number(id))
        return reply.status(204).send()
      } catch {
        return reply.status(404).send({ error: '商品が見つかりません' })
      }
    })
  }

  return app
}
