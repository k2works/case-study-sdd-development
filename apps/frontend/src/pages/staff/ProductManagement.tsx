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

  const formatComposition = (product: ProductDto) =>
    product.compositions.map((c) => `${getItemName(c.itemId)}x${c.quantity}`).join(',');

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
      <div className="toolbar">
        <h2>商品管理</h2>
        <button className="btn btn--primary" onClick={handleNew}>新規登録</button>
      </div>

      <table className="data-table" aria-label="商品一覧">
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
              <td>{formatComposition(product)}</td>
              <td>
                <button className="btn btn--sm" onClick={() => handleEdit(product)}>編集</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showForm && (
        <form className="form-section" onSubmit={handleSubmit} aria-label={editingId ? '商品編集フォーム' : '商品登録フォーム'}>
          <h3>{editingId ? '商品編集' : '商品登録'}</h3>
          <div className="form-group">
            <label className="form-label" htmlFor="product-name">商品名</label>
            <input
              className="form-input"
              id="product-name"
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="product-price">価格（税込）</label>
            <div className="form-input-group">
              <input
                className="form-input"
                id="product-price"
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                min={0}
                required
                style={{ maxWidth: '200px' }}
              />
              <span className="form-suffix">円</span>
            </div>
          </div>
          <div className="form-group">
            <h4>商品構成</h4>
            {form.compositions.map((comp, index) => (
              <div key={index} className="composition-row">
                <select
                  className="form-select"
                  value={comp.itemId}
                  onChange={(e) => handleCompositionChange(index, 'itemId', Number(e.target.value))}
                  aria-label={`構成 ${index + 1} の単品`}
                >
                  {items.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
                <div className="form-input-group">
                  <input
                    className="form-input composition-quantity"
                    type="number"
                    value={comp.quantity}
                    min={1}
                    onChange={(e) => handleCompositionChange(index, 'quantity', Number(e.target.value))}
                    aria-label={`構成 ${index + 1} の数量`}
                  />
                </div>
                <button className="btn btn--danger btn--sm" type="button" onClick={() => handleRemoveComposition(index)}>
                  削除
                </button>
              </div>
            ))}
            <button className="btn btn--sm" type="button" onClick={handleAddComposition}>
              構成を追加
            </button>
          </div>
          <div className="form-actions">
            <button className="btn btn--primary" type="submit">保存する</button>
          </div>
        </form>
      )}
    </div>
  );
}
