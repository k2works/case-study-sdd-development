import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import LoginForm from "../../components/LoginForm";

describe("LoginForm", () => {
  const defaultProps = {
    onSubmit: vi.fn(),
    errorMessage: "",
    isLoading: false,
  };

  it("should render email input field", () => {
    // Given: LoginForm コンポーネント

    // When: レンダリングする
    render(<LoginForm {...defaultProps} />);

    // Then: メールアドレス入力フィールドが表示される
    expect(screen.getByLabelText(/メールアドレス/i)).toBeInTheDocument();
  });

  it("should render password input field", () => {
    // Given: LoginForm コンポーネント

    // When: レンダリングする
    render(<LoginForm {...defaultProps} />);

    // Then: パスワード入力フィールドが表示される
    expect(screen.getByLabelText(/パスワード/i)).toBeInTheDocument();
  });

  it("should render login button", () => {
    // Given: LoginForm コンポーネント

    // When: レンダリングする
    render(<LoginForm {...defaultProps} />);

    // Then: ログインボタンが表示される
    expect(screen.getByRole("button", { name: /ログイン/i })).toBeInTheDocument();
  });

  it("should render registration link", () => {
    // Given: LoginForm コンポーネント

    // When: レンダリングする
    render(<LoginForm {...defaultProps} />);

    // Then: 新規登録リンクが表示される
    expect(screen.getByText(/新規登録/i)).toBeInTheDocument();
  });

  it("should call onSubmit with email and password when form is submitted", () => {
    // Given: フォームにメールアドレスとパスワードを入力済み
    const onSubmit = vi.fn();
    render(<LoginForm {...defaultProps} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/メールアドレス/i), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/パスワード/i), {
      target: { value: "password123" },
    });

    // When: フォームを送信する
    fireEvent.click(screen.getByRole("button", { name: /ログイン/i }));

    // Then: onSubmit がメールアドレスとパスワードで呼ばれる
    expect(onSubmit).toHaveBeenCalledWith("user@example.com", "password123");
  });

  it("should display error message when provided", () => {
    // Given: エラーメッセージあり
    const errorMessage = "メールアドレスまたはパスワードが正しくありません";

    // When: エラーメッセージ付きでレンダリングする
    render(<LoginForm {...defaultProps} errorMessage={errorMessage} />);

    // Then: エラーメッセージが表示される
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it("should not display error message when empty", () => {
    // Given: エラーメッセージなし

    // When: レンダリングする
    render(<LoginForm {...defaultProps} errorMessage="" />);

    // Then: エラーメッセージ要素が存在しない
    expect(
      screen.queryByText(/メールアドレスまたはパスワードが正しくありません/i)
    ).not.toBeInTheDocument();
  });

  it("should disable login button when loading", () => {
    // Given: ローディング中

    // When: isLoading=true でレンダリングする
    render(<LoginForm {...defaultProps} isLoading={true} />);

    // Then: ログインボタンが無効化される
    expect(screen.getByRole("button", { name: /ログイン/i })).toBeDisabled();
  });

  it("should have password input type as password", () => {
    // Given: LoginForm コンポーネント

    // When: レンダリングする
    render(<LoginForm {...defaultProps} />);

    // Then: パスワード入力フィールドの type が password である
    expect(screen.getByLabelText(/パスワード/i)).toHaveAttribute(
      "type",
      "password"
    );
  });

  it("should have email input type as email", () => {
    // Given: LoginForm コンポーネント

    // When: レンダリングする
    render(<LoginForm {...defaultProps} />);

    // Then: メールアドレス入力フィールドの type が email である
    expect(screen.getByLabelText(/メールアドレス/i)).toHaveAttribute(
      "type",
      "email"
    );
  });
});
