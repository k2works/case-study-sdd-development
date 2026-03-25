import { render, screen, act } from "@testing-library/react";
import { describe, expect, it, beforeEach } from "vitest";
import { AuthProvider, useAuth } from "../AuthProvider";

function AuthConsumer() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div>
      <span data-testid="is-authenticated">
        {isAuthenticated ? "true" : "false"}
      </span>
      <span data-testid="user-name">{user?.name ?? "none"}</span>
      <span data-testid="user-role">{user?.role ?? "none"}</span>
      <button onClick={logout}>ログアウト</button>
    </div>
  );
}

describe("AuthProvider", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should initialize as not authenticated when no token exists", () => {
    // Given: localStorage にトークンがない

    // When: AuthProvider でラップしたコンポーネントをレンダリングする
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    // Then: 未認証状態である
    expect(screen.getByTestId("is-authenticated").textContent).toBe("false");
    expect(screen.getByTestId("user-name").textContent).toBe("none");
  });

  it("should initialize as authenticated when token exists in localStorage", () => {
    // Given: localStorage にトークンが保存されている
    localStorage.setItem("token", "valid-jwt-token");

    // When: AuthProvider でラップしたコンポーネントをレンダリングする
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    // Then: 認証済み状態である
    expect(screen.getByTestId("is-authenticated").textContent).toBe("true");
  });

  it("should clear token and user on logout", () => {
    // Given: 認証済み状態
    localStorage.setItem("token", "valid-jwt-token");

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    // When: ログアウトする
    act(() => {
      screen.getByText("ログアウト").click();
    });

    // Then: 未認証状態になり、トークンが削除される
    expect(screen.getByTestId("is-authenticated").textContent).toBe("false");
    expect(localStorage.getItem("token")).toBeNull();
  });
});
