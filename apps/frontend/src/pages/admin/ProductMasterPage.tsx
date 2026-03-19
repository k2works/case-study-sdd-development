import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productsApi, type Product, type ProductInput } from '../../api/products'
import { ProductForm } from '../../components/admin/ProductForm'

export function ProductMasterPage() {
  const qc = useQueryClient()
  const [editing, setEditing] = useState<Product | null | 'new'>(null)

  const { data: products = [] } = useQuery({
    queryKey: ['admin', 'products'],
    queryFn: productsApi.getAll,
  })

  const createMutation = useMutation({
    mutationFn: productsApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'products'] }); setEditing(null) },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: number; input: ProductInput }) => productsApi.update(id, input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'products'] }); setEditing(null) },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => productsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'products'] }),
  })

  const handleSubmit = (input: ProductInput) => {
    if (editing === 'new') {
      createMutation.mutate(input)
    } else if (editing) {
      updateMutation.mutate({ id: editing.id, input })
    }
  }

  return (
    <div>
      <h1>商品マスタ</h1>
      <button onClick={() => setEditing('new')}>新規登録</button>

      {editing && (
        <ProductForm
          defaultValues={editing !== 'new' ? editing : undefined}
          onSubmit={handleSubmit}
          onCancel={() => setEditing(null)}
        />
      )}

      <table>
        <thead>
          <tr>
            <th>商品名</th>
            <th>価格</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>¥{p.price.toLocaleString()}</td>
              <td>
                <button onClick={() => setEditing(p)}>編集</button>
                <button onClick={() => deleteMutation.mutate(p.id)}>削除</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
