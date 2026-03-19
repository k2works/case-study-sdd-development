import { useForm, useFieldArray } from 'react-hook-form'
import type { ProductInput } from '../../api/products'

type Props = {
  defaultValues?: ProductInput
  onSubmit: (input: ProductInput) => void
  onCancel: () => void
}

export function ProductForm({ defaultValues, onSubmit, onCancel }: Props) {
  const { register, control, handleSubmit } = useForm<ProductInput>({
    defaultValues: defaultValues ?? { name: '', price: 0, compositions: [{ itemId: 0, quantity: 1 }] },
  })
  const { fields, append, remove } = useFieldArray({ control, name: 'compositions' })

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <label>
        商品名
        <input {...register('name')} aria-label="商品名" />
      </label>
      <label>
        価格
        <input type="number" {...register('price', { valueAsNumber: true })} aria-label="価格" />
      </label>
      <fieldset>
        <legend>商品構成</legend>
        {fields.map((f, i) => (
          <div key={f.id}>
            <input type="number" {...register(`compositions.${i}.itemId`, { valueAsNumber: true })} aria-label="単品ID" />
            <input type="number" {...register(`compositions.${i}.quantity`, { valueAsNumber: true })} aria-label="数量" />
            <button type="button" onClick={() => remove(i)}>削除</button>
          </div>
        ))}
        <button type="button" onClick={() => append({ itemId: 0, quantity: 1 })}>構成追加</button>
      </fieldset>
      <button type="submit">保存</button>
      <button type="button" onClick={onCancel}>キャンセル</button>
    </form>
  )
}
