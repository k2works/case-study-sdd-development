import Link from "next/link";

export default function HomePage() {
  return (
    <main>
      <div className="shell">
        <section className="hero">
          <span className="badge">Apps Environment Ready</span>
          <h1>Fleur Memoire Workspace</h1>
          <p>
            顧客向け注文導線とスタッフ向け管理導線の最小アプリケーション環境を
            `apps/` 配下にセットアップしました。
          </p>
        </section>

        <section className="grid">
          <Link className="card" href="/customer">
            <h2>Customer Shop</h2>
            <p>商品一覧、注文入力、注文確認へ進む顧客導線の起点です。</p>
          </Link>
          <Link className="card" href="/admin">
            <h2>Admin Console</h2>
            <p>受注、在庫、出荷のワークベンチへつながる管理導線です。</p>
          </Link>
        </section>
      </div>
    </main>
  );
}
