import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import LoginPage from "../../components/LoginPage";
import { AuthProvider } from "../../../../providers/AuthProvider";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockLogin = vi.fn();

vi.mock("../../hooks/useLogin", () => ({
  useLogin: () => ({
    mutate: mockLogin,
    isPending: false,
    error: null,
  }),
}));

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  function renderLoginPage() {
    return render(
      <MemoryRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </MemoryRouter>
    );
  }

  it("should render the login form", () => {
    // Given: LoginPage コンポーネント

    // When: レンダリングする
    renderLoginPage();

    // Then: ログインフォームが表示される
    expect(screen.getByLabelText(/メールアドレス/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/パスワード/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /ログイン/i })).toBeInTheDocument();
  });

  it("should call login when form is submitted", async () => {
    // Given: メールアドレスとパスワードを入力済み
    renderLoginPage();

    fireEvent.change(screen.getByLabelText(/メールアドレス/i), {
      target: { value: "customer@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/パスワード/i), {
      target: { value: "password123" },
    });

    // When: ログインボタンをクリックする
    fireEvent.click(screen.getByRole("button", { name: /ログイン/i }));

    // Then: login 関数が呼ばれる
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith(
        { email: "customer@example.com", password: "password123" },
        expect.any(Object)
      );
    });
  });

  it("should display error message on authentication failure", async () => {
    // Given: ログインが失敗するよう設定
    mockLogin.mockImplementation((_data: unknown, options: { onError: (err: Error) => void }) => {
      options.onError(new Error("メールアドレスまたはパスワードが正しくありません"));
    });

    renderLoginPage();

    fireEvent.change(screen.getByLabelText(/メールアドレス/i), {
      target: { value: "wrong@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/パスワード/i), {
      target: { value: "wrongPassword" },
    });

    // When: ログインボタンをクリックする
    fireEvent.click(screen.getByRole("button", { name: /ログイン/i }));

    // Then: エラーメッセージが表示される
    await waitFor(() => {
      expect(
        screen.getByText(/メールアドレスまたはパスワードが正しくありません/i)
      ).toBeInTheDocument();
    });
  });

  it("should navigate to products page for customer role", async () => {
    // Given: CUSTOMER ロールでログイン成功する
    mockLogin.mockImplementation(
      (_data: unknown, options: { onSuccess: (data: { token: string; name: string; role: string }) => void }) => {
        options.onSuccess({
          token: "jwt-token-123",
          name: "得意先太郎",
          role: "CUSTOMER",
        });
      },
    );

    renderLoginPage();

    fireEvent.change(screen.getByLabelText(/メールアドレス/i), {
      target: { value: "customer@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/パスワード/i), {
      target: { value: "password123" },
    });

    // When: ログインボタンをクリックする
    fireEvent.click(screen.getByRole("button", { name: /ログイン/i }));

    // Then: 商品一覧へ遷移する
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/products");
    });
  });

  it("should navigate to admin page for staff role", async () => {
    // Given: ORDER_STAFF ロールでログイン成功する
    mockLogin.mockImplementation(
      (_data: unknown, options: { onSuccess: (data: { token: string; name: string; role: string }) => void }) => {
        options.onSuccess({
          token: "jwt-token-456",
          name: "受注スタッフ",
          role: "ORDER_STAFF",
        });
      },
    );

    renderLoginPage();

    fireEvent.change(screen.getByLabelText(/メールアドレス/i), {
      target: { value: "staff@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/パスワード/i), {
      target: { value: "password123" },
    });

    // When: ログインボタンをクリックする
    fireEvent.click(screen.getByRole("button", { name: /ログイン/i }));

    // Then: 管理者画面へ遷移する
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/admin");
    });
  });
});
