import { useState, useEffect } from 'react';
import type { ItemDto, CreateItemInput } from '../../types/item';

interface Props {
  fetchItems: () => Promise<ItemDto[]>;
  createItem: (input: CreateItemInput) => Promise<ItemDto>;
  updateItem: (id: number, input: CreateItemInput) => Promise<ItemDto>;
}

interface FormData {
  name: string;
  qualityRetentionDays: number;
  purchaseUnit: number;
  leadTimeDays: number;
  supplierId: number;
}

const emptyForm: FormData = {
  name: '',
  qualityRetentionDays: 0,
  purchaseUnit: 0,
  leadTimeDays: 0,
  supplierId: 0,
};

export function ItemManagement({ fetchItems, createItem, updateItem }: Props) {
  const [items, setItems] = useState<ItemDto[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormData>(emptyForm);

  useEffect(() => {
    fetchItems().then(setItems);
  }, [fetchItems]);

  const handleNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const handleEdit = (item: ItemDto) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      qualityRetentionDays: item.qualityRetentionDays,
      purchaseUnit: item.purchaseUnit,
      leadTimeDays: item.leadTimeDays,
      supplierId: item.supplierId,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const input: CreateItemInput = {
      name: form.name,
      qualityRetentionDays: form.qualityRetentionDays,
      purchaseUnit: form.purchaseUnit,
      leadTimeDays: form.leadTimeDays,
      supplierId: form.supplierId,
    };

    if (editingId) {
      await updateItem(editingId, input);
    } else {
      await createItem(input);
    }

    setShowForm(false);
    setForm(emptyForm);
    const updated = await fetchItems();
    setItems(updated);
  };

  return (
    <div>
      <div className="toolbar">
        <h2>単品管理</h2>
        <button className="btn btn--primary" onClick={handleNew}>新規登録</button>
      </div>

      <table className="data-table" aria-label="単品一覧">
        <thead>
          <tr>
            <th>単品ID</th>
            <th>単品名</th>
            <th>品質維持日数</th>
            <th>購入単位</th>
            <th>リードタイム</th>
            <th>仕入先</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.name}</td>
              <td>{item.qualityRetentionDays}日</td>
              <td>{item.purchaseUnit}本</td>
              <td>{item.leadTimeDays}日</td>
              <td>{item.supplierId}</td>
              <td>
                <button className="btn btn--sm" onClick={() => handleEdit(item)}>編集</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showForm && (
        <form className="form-section" onSubmit={handleSubmit} aria-label={editingId ? '単品編集フォーム' : '単品登録フォーム'}>
          <h3>{editingId ? '単品編集' : '単品登録'}</h3>
          <div className="form-group">
            <label className="form-label" htmlFor="item-name">単品名</label>
            <input
              className="form-input"
              id="item-name"
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="item-quality">品質維持可能日数</label>
            <div className="form-input-group">
              <input
                className="form-input"
                id="item-quality"
                type="number"
                value={form.qualityRetentionDays}
                onChange={(e) => setForm({ ...form, qualityRetentionDays: Number(e.target.value) })}
                min={0}
                required
                style={{ maxWidth: '120px' }}
              />
              <span className="form-suffix">日</span>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="item-unit">購入単位</label>
            <div className="form-input-group">
              <input
                className="form-input"
                id="item-unit"
                type="number"
                value={form.purchaseUnit}
                onChange={(e) => setForm({ ...form, purchaseUnit: Number(e.target.value) })}
                min={0}
                required
                style={{ maxWidth: '120px' }}
              />
              <span className="form-suffix">本</span>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="item-lead">発注リードタイム</label>
            <div className="form-input-group">
              <input
                className="form-input"
                id="item-lead"
                type="number"
                value={form.leadTimeDays}
                onChange={(e) => setForm({ ...form, leadTimeDays: Number(e.target.value) })}
                min={0}
                required
                style={{ maxWidth: '120px' }}
              />
              <span className="form-suffix">日</span>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="item-supplier">仕入先ID</label>
            <input
              className="form-input"
              id="item-supplier"
              type="number"
              value={form.supplierId}
              onChange={(e) => setForm({ ...form, supplierId: Number(e.target.value) })}
              min={0}
              required
              style={{ maxWidth: '120px' }}
            />
          </div>
          <div className="form-actions">
            <button className="btn btn--primary" type="submit">保存する</button>
          </div>
        </form>
      )}
    </div>
  );
}
