import { useForm } from 'react-hook-form'
import type { ItemInput } from '../../api/items'

type Props = {
  defaultValues?: ItemInput
  onSubmit: (input: ItemInput) => void
  onCancel: () => void
}

export function ItemForm({ defaultValues, onSubmit, onCancel }: Props) {
  const { register, handleSubmit } = useForm<ItemInput>({
    defaultValues: defaultValues ?? { name: '', supplierId: 0, shelfLife: 1 },
  })
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <label>単品名<input {...register('name')} aria-label="単品名" /></label>
      <label>仕入先ID<input type="number" {...register('supplierId', { valueAsNumber: true })} aria-label="仕入先ID" /></label>
      <label>品質維持日数<input type="number" {...register('shelfLife', { valueAsNumber: true })} aria-label="品質維持日数" /></label>
      <button type="submit">保存</button>
      <button type="button" onClick={onCancel}>キャンセル</button>
    </form>
  )
}
