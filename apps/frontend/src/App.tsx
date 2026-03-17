import { useState } from 'react'
import { ItemManagement } from './pages/staff/ItemManagement'
import { ProductManagement } from './pages/staff/ProductManagement'
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

type Tab = 'items' | 'products';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('items');

  return (
    <div>
      <nav>
        <strong>フレール・メモワール 管理画面</strong>
        <div>
          <button onClick={() => setActiveTab('items')} disabled={activeTab === 'items'}>
            単品管理
          </button>
          <button onClick={() => setActiveTab('products')} disabled={activeTab === 'products'}>
            商品管理
          </button>
        </div>
      </nav>
      <main>
        {activeTab === 'items' && (
          <ItemManagement
            fetchItems={fetchItems}
            createItem={createItem}
            updateItem={updateItem}
          />
        )}
        {activeTab === 'products' && (
          <ProductManagement
            fetchProducts={fetchProducts}
            createProduct={createProduct}
            updateProduct={updateProduct}
            fetchItems={fetchItems}
          />
        )}
      </main>
    </div>
  )
}

export default App
