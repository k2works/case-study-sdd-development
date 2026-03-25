import { useAuth } from "../providers/AuthProvider";

export default function AdminStubPage() {
  const { logout } = useAuth();

  return (
    <div>
      <h1>ダッシュボード（スタブ）</h1>
      <button onClick={logout}>ログアウト</button>
    </div>
  );
}
