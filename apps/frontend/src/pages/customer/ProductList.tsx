import { useState, useEffect } from 'react';
import type { ProductDto } from '../../types/product';
import type { ItemDto } from '../../types/item';

interface Props {
  fetchProducts: () => Promise<ProductDto[]>;
  fetchItems: () => Promise<ItemDto[]>;
}

export function ProductList({ fetchProducts, fetchItems }: Props) {
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [items, setItems] = useState<ItemDto[]>([]);

  useEffect(() => {
    fetchProducts().then(setProducts);
    fetchItems().then(setItems);
  }, [fetchProducts, fetchItems]);

  const getItemName = (itemId: number) => items.find((i) => i.id === itemId)?.name ?? `ID:${itemId}`;

  if (products.length === 0 && items.length >= 0) {
    return (
      <div>
        <h2>花束一覧</h2>
        <p>現在、商品はありません</p>
      </div>
    );
  }

  return (
    <div>
      <h2>花束一覧</h2>
      <div>
        {products.map((product) => (
          <div key={product.id} style={{ border: '1px solid #ccc', padding: '16px', marginBottom: '16px' }}>
            <h3>{product.name}</h3>
            <p>¥{product.price.toLocaleString()}（税込）</p>
            <div>
              <strong>構成:</strong>
              <ul>
                {product.compositions.map((c, i) => (
                  <li key={i}>{getItemName(c.itemId)} × {c.quantity}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
