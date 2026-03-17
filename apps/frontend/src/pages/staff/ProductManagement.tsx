import { useState, useEffect } from 'react';
import type { ProductDto, CreateProductInput, CompositionDto } from '../../types/product';
import type { ItemDto } from '../../types/item';

interface Props {
  fetchProducts: () => Promise<ProductDto[]>;
  createProduct: (input: CreateProductInput) => Promise<ProductDto>;
  updateProduct: (id: number, input: CreateProductInput) => Promise<ProductDto>;
  fetchItems: () => Promise<ItemDto[]>;
}

interface FormData {
  name: string;
  price: number;
  compositions: CompositionDto[];
}

const emptyForm: FormData = { name: '', price: 0, compositions: [] };

export function ProductManagement({ fetchProducts, createProduct, updateProduct, fetchItems }: Props) {
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [items, setItems] = useState<ItemDto[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormData>(emptyForm);

  useEffect(() => {
    fetchProducts().then(setProducts);
    fetchItems().then(setItems);
  }, [fetchProducts, fetchItems]);

  const getItemName = (itemId: number) => items.find((i) => i.id === itemId)?.name ?? `ID:${itemId}`;

  const formatPrice = (price: number) => `¥${price.toLocaleString()}`;

  const handleNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const handleEdit = (product: ProductDto) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      price: product.price,
      compositions: [...product.compositions],
    });
    setShowForm(true);
  };

  const handleAddComposition = () => {
    setForm({
      ...form,
      compositions: [...form.compositions, { itemId: items[0]?.id ?? 0, quantity: 1 }],
    });
  };

  const handleRemoveComposition = (index: number) => {
    setForm({
      ...form,
      compositions: form.compositions.filter((_, i) => i !== index),
    });
  };

  const handleCompositionChange = (index: number, field: 'itemId' | 'quantity', value: number) => {
    const updated = [...form.compositions];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, compositions: updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const input: CreateProductInput = {
      name: form.name,
      price: form.price,
      compositions: form.compositions,
    };

    if (editingId) {
      await updateProduct(editingId, input);
    } else {
      await createProduct(input);
    }

    setShowForm(false);
    setForm(emptyForm);
    const updated = await fetchProducts();
    setProducts(updated);
  };

  return (
    <div>
      <h2>商品管理</h2>
      <button onClick={handleNew}>新規登録</button>

      <table>
        <thead>
          <tr>
            <th>商品ID</th>
            <th>商品名</th>
            <th>価格</th>
            <th>構成</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>{product.id}</td>
              <td>{product.name}</td>
              <td>{formatPrice(product.price)}</td>
              <td>
                {product.compositions.map((c, i) => (
                  <span key={i}>
                    {getItemName(c.itemId)} × {c.quantity}
                    {i < product.compositions.length - 1 ? '、' : ''}
                  </span>
                ))}
              </td>
              <td>
                <button onClick={() => handleEdit(product)}>編集</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showForm && (
        <form onSubmit={handleSubmit}>
          <h3>{editingId ? '商品編集' : '商品登録'}</h3>
          <div>
            <label htmlFor="product-name">商品名</label>
            <input
              id="product-name"
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="product-price">価格（税込）</label>
            <input
              id="product-price"
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
            />
          </div>
          <div>
            <h4>商品構成</h4>
            {form.compositions.map((comp, index) => (
              <div key={index}>
                <select
                  value={comp.itemId}
                  onChange={(e) => handleCompositionChange(index, 'itemId', Number(e.target.value))}
                >
                  {items.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  value={comp.quantity}
                  min={1}
                  onChange={(e) => handleCompositionChange(index, 'quantity', Number(e.target.value))}
                />
                <button type="button" onClick={() => handleRemoveComposition(index)}>
                  削除
                </button>
              </div>
            ))}
            <button type="button" onClick={handleAddComposition}>
              構成を追加
            </button>
          </div>
          <button type="submit">保存する</button>
        </form>
      )}
    </div>
  );
}
