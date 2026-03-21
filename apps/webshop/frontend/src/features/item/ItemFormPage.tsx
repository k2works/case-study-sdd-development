import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { itemApi } from '../../lib/item-api'
import type { ItemRequest, Item } from '../../types/item'

export function ItemFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isEdit = !!id
  const [error, setError] = useState<string | null>(null)

  const { data: existingItem } = useQuery<Item>({
    queryKey: ['items', id],
    queryFn: async () => {
      const res = await itemApi.findById(Number(id))
      return res.data
    },
    enabled: isEdit,
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ItemRequest>()

  useEffect(() => {
    if (existingItem) {
      reset({
        name: existingItem.name,
        shelfLifeDays: existingItem.shelfLifeDays,
        purchaseUnit: existingItem.purchaseUnit,
        leadTimeDays: existingItem.leadTimeDays,
        supplierName: existingItem.supplierName,
      })
    }
  }, [existingItem, reset])

  const createMutation = useMutation({
    mutationFn: (data: ItemRequest) => itemApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] })
      navigate('/items')
    },
    onError: () => setError('登録に失敗しました'),
  })

  const updateMutation = useMutation({
    mutationFn: (data: ItemRequest) => itemApi.update(Number(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] })
      navigate('/items')
    },
    onError: () => setError('更新に失敗しました'),
  })

  const onSubmit = (data: ItemRequest) => {
    setError(null)
    const request = {
      ...data,
      shelfLifeDays: Number(data.shelfLifeDays),
      purchaseUnit: Number(data.purchaseUnit),
      leadTimeDays: Number(data.leadTimeDays),
    }
    if (isEdit) {
      updateMutation.mutate(request)
    } else {
      createMutation.mutate(request)
    }
  }

  return (
    <div className="item-form-page">
      <h2>{isEdit ? '単品編集' : '単品登録'}</h2>
      {error && <p className="error-message" role="alert">{error}</p>}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-group">
          <label htmlFor="name">商品名</label>
          <input
            id="name"
            type="text"
            {...register('name', { required: '商品名は必須です' })}
          />
          {errors.name && (
            <span className="field-error">{errors.name.message}</span>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="shelfLifeDays">品質保持日数</label>
          <input
            id="shelfLifeDays"
            type="number"
            {...register('shelfLifeDays', {
              required: '品質保持日数は必須です',
              min: { value: 1, message: '1以上を入力してください' },
            })}
          />
          {errors.shelfLifeDays && (
            <span className="field-error">{errors.shelfLifeDays.message}</span>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="purchaseUnit">発注単位</label>
          <input
            id="purchaseUnit"
            type="number"
            {...register('purchaseUnit', {
              required: '発注単位は必須です',
              min: { value: 1, message: '1以上を入力してください' },
            })}
          />
          {errors.purchaseUnit && (
            <span className="field-error">{errors.purchaseUnit.message}</span>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="leadTimeDays">リードタイム（日）</label>
          <input
            id="leadTimeDays"
            type="number"
            {...register('leadTimeDays', {
              required: 'リードタイムは必須です',
              min: { value: 1, message: '1以上を入力してください' },
            })}
          />
          {errors.leadTimeDays && (
            <span className="field-error">{errors.leadTimeDays.message}</span>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="supplierName">仕入先名</label>
          <input
            id="supplierName"
            type="text"
            {...register('supplierName', { required: '仕入先名は必須です' })}
          />
          {errors.supplierName && (
            <span className="field-error">{errors.supplierName.message}</span>
          )}
        </div>
        <div className="form-actions">
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? '保存中...' : '保存'}
          </button>
          <button type="button" onClick={() => navigate('/items')}>
            キャンセル
          </button>
        </div>
      </form>
    </div>
  )
}
