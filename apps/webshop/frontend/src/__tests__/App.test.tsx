import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "../App";

describe("App", () => {
  it("should render without crashing", () => {
    // Given: App コンポーネントが存在する

    // When: App をレンダリングする
    render(<App />);

    // Then: エラーなくレンダリングされる（DOM にマウントされる）
    expect(document.querySelector("#root") || document.body).toBeTruthy();
  });

  it("should display the login page by default", () => {
    // Given: 未認証状態

    // When: App をレンダリングする
    render(<App />);

    // Then: ログインフォームが表示される
    expect(screen.getByRole("button", { name: /ログイン/i })).toBeInTheDocument();
  });

  it("should redirect to login after logout from protected page", () => {
    // Given: 認証済み状態で商品一覧ページを開いている
    localStorage.setItem("token", "valid-jwt-token");
    window.history.pushState({}, "", "/products");
    render(<App />);
    expect(screen.getByText(/商品一覧（スタブ）/i)).toBeInTheDocument();

    // When: ログアウトボタンをクリックする
    fireEvent.click(screen.getByRole("button", { name: /ログアウト/i }));

    // Then: ログインページへリダイレクトされる
    expect(screen.getByRole("button", { name: /ログイン/i })).toBeInTheDocument();
  });
});
