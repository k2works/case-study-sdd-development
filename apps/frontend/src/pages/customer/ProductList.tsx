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

  const formatComposition = (product: ProductDto) =>
    product.compositions.map((c) => `${getItemName(c.itemId)}x${c.quantity}`).join(', ');

  if (products.length === 0) {
    return (
      <div>
        <h2>花束一覧</h2>
        <div className="empty-state">
          <p>現在、商品はありません</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2>花束一覧</h2>
      <div className="product-grid">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <h3 className="product-card__name">{product.name}</h3>
            <p className="product-card__description">
              {formatComposition(product)}
            </p>
            <p className="product-card__price">
              ¥{product.price.toLocaleString()}（税込）
            </p>
            <div className="product-card__actions">
              <button className="btn btn--primary" type="button">
                注文する
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
