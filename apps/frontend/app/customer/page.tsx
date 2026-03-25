"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Product = {
  productId: string;
  productName: string;
  description: string;
  price: number;
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";
const fallbackProducts: Product[] = [
  {
    productId: "rose-garden",
    productName: "ローズガーデン",
    description: "赤バラとグリーンを束ねた、記念日向けの定番ブーケです。",
    price: 5500,
  },
  {
    productId: "seasonal-mimosa",
    productName: "季節のミモザブーケ",
    description: "旬のミモザを主役にした、春の贈り物向けの花束です。",
    price: 4800,
  },
  {
    productId: "white-lily",
    productName: "ホワイトリリー",
    description: "白を基調にまとめた、上品で落ち着いたアレンジです。",
    price: 6200,
  },
];

export default function CustomerPage() {
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadProducts = async () => {
      if (active && products.length === 0) {
        setLoading(true);
      }

      try {
        const controller = new AbortController();
        const timeoutId = window.setTimeout(() => controller.abort(), 1000);
        const response = await fetch(`${apiBaseUrl}/customer/products`, {
          signal: controller.signal,
        });
        window.clearTimeout(timeoutId);

        if (!response.ok) {
          if (active) {
            setProducts(fallbackProducts);
            setError(null);
            setLoading(false);
          }

          return;
        }

        const data = (await response.json()) as Product[];

        if (active) {
          setProducts(data);
          setError(null);
          setLoading(false);
        }
      } catch {
        if (active) {
          setProducts(fallbackProducts);
          setError(null);
          setLoading(false);
        }
      }
    };

    void loadProducts();

    return () => {
      active = false;
    };
  }, [products.length]);

  return (
    <main>
      <div className="shell">
        <section className="hero">
          <span className="badge">Customer Shop</span>
          <h1>花束を選んで注文する</h1>
          <p>
            記念日や贈り先に合わせて花束を選び、そのまま注文入力へ進めます。
          </p>
        </section>

        <section aria-labelledby="product-list-heading" className="product-section">
          <div className="section-heading">
            <h2 id="product-list-heading">商品一覧</h2>
            <p>まずは注文したい花束を 1 つ選択してください。</p>
          </div>

          {loading ? <p className="admin-empty">商品一覧を読み込んでいます。</p> : null}
          {!loading && error ? <p className="admin-empty">{error}</p> : null}

          {!loading && !error ? (
            <div className="product-grid">
              {products.map((product) => (
                <article
                  aria-label={product.productName}
                  className="product-card"
                  key={product.productId}
                >
                  <div>
                    <span className="product-tag">Bouquet</span>
                    <h3>{product.productName}</h3>
                    <p>{product.description}</p>
                    <p>税込 {product.price.toLocaleString("ja-JP")} 円</p>
                  </div>
                  <Link
                    className="primary-link"
                    href={`/customer/order?product=${product.productId}`}
                  >
                    この花束を注文する
                  </Link>
                </article>
              ))}
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
