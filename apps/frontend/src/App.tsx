import { useState } from 'react'
import { ItemManagement } from './pages/staff/ItemManagement'
import { ProductManagement } from './pages/staff/ProductManagement'
import { ProductList } from './pages/customer/ProductList'
import type { ItemDto, CreateItemInput } from './types/item'
import type { ProductDto, CreateProductInput } from './types/product'

const API_BASE = '/api';

const fetchItems = async (): Promise<ItemDto[]> => {
  const res = await fetch(`${API_BASE}/items`);
  return res.json();
};

const createItem = async (input: CreateItemInput): Promise<ItemDto> => {
  const res = await fetch(`${API_BASE}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return res.json();
};

const updateItem = async (id: number, input: CreateItemInput): Promise<ItemDto> => {
  const res = await fetch(`${API_BASE}/items/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return res.json();
};

const fetchProducts = async (): Promise<ProductDto[]> => {
  const res = await fetch(`${API_BASE}/products`);
  return res.json();
};

const createProduct = async (input: CreateProductInput): Promise<ProductDto> => {
  const res = await fetch(`${API_BASE}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return res.json();
};

const updateProduct = async (id: number, input: CreateProductInput): Promise<ProductDto> => {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return res.json();
};

type View = 'customer' | 'staff';
type StaffTab = 'products' | 'items';

function App() {
  const [view, setView] = useState<View>('customer');
  const [staffTab, setStaffTab] = useState<StaffTab>('products');

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">フレール・メモワール WEB ショップ</h1>
        <nav className="app-nav" aria-label="メインナビゲーション">
          <button
            className={`nav-button${view === 'customer' ? ' nav-button--active' : ''}`}
            onClick={() => setView('customer')}
            disabled={view === 'customer'}
            aria-current={view === 'customer' ? 'page' : undefined}
          >
            花束一覧
          </button>
          <button
            className={`nav-button${view === 'staff' ? ' nav-button--active' : ''}`}
            onClick={() => setView('staff')}
            disabled={view === 'staff'}
            aria-current={view === 'staff' ? 'page' : undefined}
          >
            管理画面
          </button>
        </nav>
      </header>
      <main className="app-main">
        {view === 'customer' && (
          <ProductList
            fetchProducts={fetchProducts}
            fetchItems={fetchItems}
          />
        )}
        {view === 'staff' && (
          <>
            <div className="staff-tabs" role="tablist" aria-label="管理メニュー">
              <button
                className={`staff-tab${staffTab === 'products' ? ' staff-tab--active' : ''}`}
                role="tab"
                aria-selected={staffTab === 'products'}
                aria-controls="panel-products"
                onClick={() => setStaffTab('products')}
                disabled={staffTab === 'products'}
              >
                商品管理
              </button>
              <button
                className={`staff-tab${staffTab === 'items' ? ' staff-tab--active' : ''}`}
                role="tab"
                aria-selected={staffTab === 'items'}
                aria-controls="panel-items"
                onClick={() => setStaffTab('items')}
                disabled={staffTab === 'items'}
              >
                単品管理
              </button>
            </div>
            <div role="tabpanel" id={`panel-${staffTab}`}>
              {staffTab === 'products' && (
                <ProductManagement
                  fetchProducts={fetchProducts}
                  createProduct={createProduct}
                  updateProduct={updateProduct}
                  fetchItems={fetchItems}
                />
              )}
              {staffTab === 'items' && (
                <ItemManagement
                  fetchItems={fetchItems}
                  createItem={createItem}
                  updateItem={updateItem}
                />
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default App
