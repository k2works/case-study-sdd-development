import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { itemApi } from '../../lib/item-api'
import type { ItemRequest, Item } from '../../types/item'

const inputClass =
  'w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors'

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
        qualityRetentionDays: existingItem.qualityRetentionDays,
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
      qualityRetentionDays: Number(data.qualityRetentionDays),
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
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">
        {isEdit ? '単品編集' : '単品登録'}
      </h2>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-6" role="alert">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              商品名
            </label>
            <input id="name" type="text" className={inputClass} placeholder="バラ（赤）"
              {...register('name', { required: '商品名は必須です' })}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="qualityRetentionDays" className="block text-sm font-medium text-gray-700 mb-1">
                品質保持日数
              </label>
              <input id="qualityRetentionDays" type="number" className={inputClass} placeholder="7"
                {...register('qualityRetentionDays', {
                  required: '品質保持日数は必須です',
                  min: { value: 1, message: '1以上を入力してください' },
                })}
              />
              {errors.qualityRetentionDays && (
                <p className="text-red-500 text-sm mt-1">{errors.qualityRetentionDays.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="purchaseUnit" className="block text-sm font-medium text-gray-700 mb-1">
                発注単位
              </label>
              <input id="purchaseUnit" type="number" className={inputClass} placeholder="10"
                {...register('purchaseUnit', {
                  required: '発注単位は必須です',
                  min: { value: 1, message: '1以上を入力してください' },
                })}
              />
              {errors.purchaseUnit && (
                <p className="text-red-500 text-sm mt-1">{errors.purchaseUnit.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="leadTimeDays" className="block text-sm font-medium text-gray-700 mb-1">
                リードタイム（日）
              </label>
              <input id="leadTimeDays" type="number" className={inputClass} placeholder="3"
                {...register('leadTimeDays', {
                  required: 'リードタイムは必須です',
                  min: { value: 1, message: '1以上を入力してください' },
                })}
              />
              {errors.leadTimeDays && (
                <p className="text-red-500 text-sm mt-1">{errors.leadTimeDays.message}</p>
              )}
            </div>
          </div>
          <div>
            <label htmlFor="supplierName" className="block text-sm font-medium text-gray-700 mb-1">
              仕入先名
            </label>
            <input id="supplierName" type="text" className={inputClass} placeholder="花卸問屋A"
              {...register('supplierName', { required: '仕入先名は必須です' })}
            />
            {errors.supplierName && (
              <p className="text-red-500 text-sm mt-1">{errors.supplierName.message}</p>
            )}
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-emerald-600 text-white font-medium rounded-lg px-6 py-3 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '保存中...' : '保存'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/items')}
              className="bg-white text-gray-700 font-medium rounded-lg px-6 py-3 border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              キャンセル
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
