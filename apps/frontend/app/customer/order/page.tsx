const productNames = {
  "rose-garden": "ローズガーデン",
  "seasonal-mimosa": "季節のミモザブーケ",
  "white-memories": "ホワイトメモリーズ",
} as const;

type ProductId = keyof typeof productNames;

type OrderPageProps = {
  searchParams?: Promise<{
    product?: string;
  }>;
};

function resolveProductName(productId?: string) {
  if (!productId) {
    return "未選択";
  }

  if (productId in productNames) {
    return productNames[productId as ProductId];
  }

  return "対象外の商品です";
}

export default async function OrderPage({ searchParams }: OrderPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const productName = resolveProductName(params?.product);

  return (
    <main>
      <div className="shell">
        <section className="hero">
          <span className="badge">Order Form</span>
          <h1>注文入力</h1>
          <p>選択した花束を確認し、次のステップで届け日や届け先を入力します。</p>
        </section>

        <section className="order-summary" aria-label="注文入力サマリー">
          <h2>選択中の商品</h2>
          <p className="order-product-name">{productName}</p>
          <p>
            この画面を基点に、次の spec で届け日、届け先、メッセージ入力を追加します。
          </p>
        </section>
      </div>
    </main>
  );
}
