import { render, screen } from "@testing-library/react";
import { describe, expect, it, beforeEach } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "../ProtectedRoute";
import { AuthProvider } from "../../providers/AuthProvider";

describe("ProtectedRoute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  function renderWithRoute(initialPath: string) {
    return render(
      <MemoryRouter initialEntries={[initialPath]}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<div>ログインページ</div>} />
            <Route
              path="/protected"
              element={
                <ProtectedRoute>
                  <div>保護されたコンテンツ</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );
  }

  it("should redirect to login when not authenticated", () => {
    // Given: 未認証状態

    // When: 保護されたルートにアクセスする
    renderWithRoute("/protected");

    // Then: ログインページにリダイレクトされる
    expect(screen.getByText("ログインページ")).toBeInTheDocument();
    expect(screen.queryByText("保護されたコンテンツ")).not.toBeInTheDocument();
  });

  it("should render children when authenticated", () => {
    // Given: 認証済み状態（トークンが localStorage にある）
    localStorage.setItem("token", "valid-jwt-token");

    // When: 保護されたルートにアクセスする
    renderWithRoute("/protected");

    // Then: 保護されたコンテンツが表示される
    expect(screen.getByText("保護されたコンテンツ")).toBeInTheDocument();
  });
});
