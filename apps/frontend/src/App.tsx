import { ItemManagement } from './pages/staff/ItemManagement'
import type { ItemDto, CreateItemInput } from './types/item'

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

function App() {
  return (
    <div>
      <nav>
        <strong>フレール・メモワール 管理画面</strong>
      </nav>
      <main>
        <ItemManagement
          fetchItems={fetchItems}
          createItem={createItem}
          updateItem={updateItem}
        />
      </main>
    </div>
  )
}

export default App
