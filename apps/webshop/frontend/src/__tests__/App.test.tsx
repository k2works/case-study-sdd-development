import { render, screen } from "@testing-library/react";
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

  it("should display the application title", () => {
    // Given: App コンポーネントが存在する

    // When: App をレンダリングする
    render(<App />);

    // Then: アプリケーションのタイトルが表示される
    expect(
      screen.getByText(/フレール・メモワール/i)
    ).toBeInTheDocument();
  });
});
