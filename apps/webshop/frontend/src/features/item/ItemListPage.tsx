import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { itemApi } from '../../lib/item-api'
import type { Item } from '../../types/item'

export function ItemListPage() {
  const queryClient = useQueryClient()

  const { data: items = [], isLoading } = useQuery<Item[]>({
    queryKey: ['items'],
    queryFn: async () => {
      const res = await itemApi.findAll()
      return res.data
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => itemApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] })
    },
  })

  const handleDelete = (id: number, name: string) => {
    if (window.confirm(`「${name}」を削除しますか？`)) {
      deleteMutation.mutate(id)
    }
  }

  return (
    <div className="item-list-page">
      <div className="page-header">
        <h2>単品管理</h2>
        <Link to="/items/new" className="btn-primary">
          新規登録
        </Link>
      </div>

      {isLoading ? (
        <p>読み込み中...</p>
      ) : items.length === 0 ? (
        <p>登録された単品はありません。</p>
      ) : (
        <table className="item-table">
          <thead>
            <tr>
              <th>商品名</th>
              <th>品質保持日数</th>
              <th>発注単位</th>
              <th>リードタイム</th>
              <th>仕入先</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.shelfLifeDays}日</td>
                <td>{item.purchaseUnit}</td>
                <td>{item.leadTimeDays}日</td>
                <td>{item.supplierName}</td>
                <td>
                  <Link to={`/items/${item.id}/edit`}>編集</Link>
                  <button onClick={() => handleDelete(item.id, item.name)}>
                    削除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
