import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { itemsApi, type Item, type ItemInput } from '../../api/items'
import { ItemForm } from '../../components/admin/ItemForm'

export function ItemMasterPage() {
  const qc = useQueryClient()
  const [editing, setEditing] = useState<Item | null | 'new'>(null)

  const { data: items = [] } = useQuery({ queryKey: ['admin', 'items'], queryFn: itemsApi.getAll })

  const createMutation = useMutation({
    mutationFn: itemsApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'items'] }); setEditing(null) },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: number; input: ItemInput }) => itemsApi.update(id, input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'items'] }); setEditing(null) },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => itemsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'items'] }),
  })

  const handleSubmit = (input: ItemInput) => {
    if (editing === 'new') createMutation.mutate(input)
    else if (editing) updateMutation.mutate({ id: editing.id, input })
  }

  return (
    <div>
      <h1>単品マスタ</h1>
      <button onClick={() => setEditing('new')}>新規登録</button>

      {editing && (
        <ItemForm
          defaultValues={editing !== 'new' ? editing : undefined}
          onSubmit={handleSubmit}
          onCancel={() => setEditing(null)}
        />
      )}

      <table>
        <thead>
          <tr><th>単品名</th><th>品質維持日数</th><th>操作</th></tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{item.shelfLife}日</td>
              <td>
                <button onClick={() => setEditing(item)}>編集</button>
                <button onClick={() => deleteMutation.mutate(item.id)}>削除</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
