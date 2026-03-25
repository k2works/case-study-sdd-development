import { useAuth } from "../providers/AuthProvider";

export default function ProductsStubPage() {
  const { logout } = useAuth();

  return (
    <div>
      <h1>商品一覧（スタブ）</h1>
      <button onClick={logout}>ログアウト</button>
    </div>
  );
}
