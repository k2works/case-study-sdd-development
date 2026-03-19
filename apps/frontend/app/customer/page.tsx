import Link from "next/link";

const products = [
  {
    id: "rose-garden",
    name: "ローズガーデン",
    description: "赤バラとグリーンを束ねた、記念日向けの定番ブーケです。",
  },
  {
    id: "seasonal-mimosa",
    name: "季節のミモザブーケ",
    description: "旬のミモザを主役にした、春の贈り物向けの花束です。",
  },
  {
    id: "white-memories",
    name: "ホワイトメモリーズ",
    description: "白を基調にまとめた、上品で落ち着いたアレンジです。",
  },
] as const;

export default function CustomerPage() {
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

          <div className="product-grid">
            {products.map((product) => (
              <article
                aria-label={product.name}
                className="product-card"
                key={product.id}
              >
                <div>
                  <span className="product-tag">Bouquet</span>
                  <h3>{product.name}</h3>
                  <p>{product.description}</p>
                </div>
                <Link
                  className="primary-link"
                  href={`/customer/order?product=${product.id}`}
                >
                  この花束を注文する
                </Link>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
