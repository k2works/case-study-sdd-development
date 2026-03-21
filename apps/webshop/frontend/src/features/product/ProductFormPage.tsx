import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { productApi } from '../../lib/product-api'
import type { ProductRequest } from '../../types/product'

export function ProductFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isEdit = !!id

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProductRequest>({
    defaultValues: {
      name: '',
      price: 0,
      description: null,
    },
  })

  useEffect(() => {
    if (isEdit) {
      productApi.findById(Number(id)).then((res) => {
        const product = res.data
        setValue('name', product.name)
        setValue('price', product.price)
        setValue('description', product.description)
      })
    }
  }, [id, isEdit, setValue])

  const createMutation = useMutation({
    mutationFn: (data: ProductRequest) => productApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      navigate('/products')
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: ProductRequest) => productApi.update(Number(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      navigate('/products')
    },
  })

  const onSubmit = (data: ProductRequest) => {
    if (isEdit) {
      updateMutation.mutate(data)
    } else {
      createMutation.mutate(data)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">
        {isEdit ? '商品編集' : '商品登録'}
      </h2>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              商品名 <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              {...register('name', {
                required: '商品名は必須です',
                maxLength: { value: 50, message: '商品名は50文字以内で入力してください' },
              })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
              価格（円） <span className="text-red-500">*</span>
            </label>
            <input
              id="price"
              type="number"
              min="1"
              max="999999"
              {...register('price', {
                required: '価格は必須です',
                min: { value: 1, message: '価格は1円以上で入力してください' },
                max: { value: 999999, message: '価格は999,999円以下で入力してください' },
                valueAsNumber: true,
              })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
            {errors.price && (
              <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              説明
            </label>
            <textarea
              id="description"
              rows={4}
              {...register('description')}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="bg-emerald-600 text-white font-medium rounded-lg px-6 py-2.5 hover:bg-emerald-700 shadow-sm transition-all text-sm"
            >
              {isEdit ? '更新' : '登録'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/products')}
              className="bg-white text-gray-700 font-medium rounded-lg px-6 py-2.5 border border-gray-300 hover:bg-gray-50 transition-all text-sm"
            >
              キャンセル
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
