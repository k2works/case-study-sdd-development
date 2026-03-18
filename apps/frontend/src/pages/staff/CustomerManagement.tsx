import { useState, useEffect } from 'react';
import type { CustomerDto, CreateCustomerInput, DestinationDto } from '../../types/customer';

interface Props {
  fetchCustomers: () => Promise<CustomerDto[]>;
  createCustomer: (input: CreateCustomerInput) => Promise<CustomerDto>;
  updateCustomer: (id: number, input: CreateCustomerInput) => Promise<CustomerDto>;
  fetchDestinations: (customerId: number) => Promise<DestinationDto[]>;
}

interface FormData {
  name: string;
  phone: string;
  email: string;
}

const emptyForm: FormData = {
  name: '',
  phone: '',
  email: '',
};

export function CustomerManagement({
  fetchCustomers,
  createCustomer,
  updateCustomer,
  fetchDestinations,
}: Readonly<Props>) {
  const [customers, setCustomers] = useState<CustomerDto[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormData>(emptyForm);

  // 届け先表示の状態
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [destinations, setDestinations] = useState<DestinationDto[]>([]);

  useEffect(() => {
    fetchCustomers().then(setCustomers);
  }, [fetchCustomers]);

  const handleNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
    setSelectedCustomerId(null);
  };

  const handleEdit = (customer: CustomerDto) => {
    setEditingId(customer.customerId);
    setForm({
      name: customer.name,
      phone: customer.phone,
      email: customer.email ?? '',
    });
    setShowForm(true);
    setSelectedCustomerId(null);
  };

  const handleShowDestinations = async (customerId: number) => {
    setShowForm(false);
    setSelectedCustomerId(customerId);
    const dests = await fetchDestinations(customerId);
    setDestinations(dests);
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input: CreateCustomerInput = {
      name: form.name,
      phone: form.phone,
      email: form.email || null,
    };

    if (editingId) {
      await updateCustomer(editingId, input);
    } else {
      await createCustomer(input);
    }

    setShowForm(false);
    setForm(emptyForm);
    const updated = await fetchCustomers();
    setCustomers(updated);
  };

  return (
    <div>
      <div className="toolbar">
        <h2>得意先管理</h2>
        <button className="btn btn--primary" onClick={handleNew}>新規登録</button>
      </div>

      <table className="data-table" aria-label="得意先一覧">
        <thead>
          <tr>
            <th>得意先ID</th>
            <th>得意先名</th>
            <th>電話番号</th>
            <th>メールアドレス</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr key={customer.customerId}>
              <td>{customer.customerId}</td>
              <td>{customer.name}</td>
              <td>{customer.phone}</td>
              <td>{customer.email ?? '-'}</td>
              <td>
                <button className="btn btn--sm" onClick={() => handleEdit(customer)}>編集</button>
                <button className="btn btn--sm" onClick={() => handleShowDestinations(customer.customerId)}>
                  届け先
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showForm && (
        <form
          className="form-section"
          onSubmit={handleSubmit}
          aria-label={editingId ? '得意先編集フォーム' : '得意先登録フォーム'}
        >
          <h3>{editingId ? '得意先編集' : '得意先登録'}</h3>
          <div className="form-group">
            <label className="form-label" htmlFor="customer-name">得意先名</label>
            <input
              className="form-input"
              id="customer-name"
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="customer-phone">電話番号</label>
            <input
              className="form-input"
              id="customer-phone"
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="customer-email">メールアドレス</label>
            <input
              className="form-input"
              id="customer-email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="form-actions">
            <button className="btn btn--primary" type="submit">保存する</button>
          </div>
        </form>
      )}

      {selectedCustomerId !== null && (
        <div className="form-section">
          <h3>届け先一覧</h3>
          {destinations.length === 0 ? (
            <p>届け先が登録されていません</p>
          ) : (
            <table className="data-table" aria-label="届け先一覧">
              <thead>
                <tr>
                  <th>届け先名</th>
                  <th>住所</th>
                  <th>電話番号</th>
                </tr>
              </thead>
              <tbody>
                {destinations.map((dest) => (
                  <tr key={dest.destinationId}>
                    <td>{dest.name}</td>
                    <td>{dest.address}</td>
                    <td>{dest.phone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
