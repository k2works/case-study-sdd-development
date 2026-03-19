import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import OrderPage from "./page";

describe("OrderPage", () => {
  it("選択した商品を注文入力画面で確認できる", async () => {
    render(
      await OrderPage({
        searchParams: Promise.resolve({ product: "rose-garden" }),
      }),
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "注文入力" }),
    ).toBeInTheDocument();
    expect(screen.getByText("選択中の商品")).toBeInTheDocument();
    expect(screen.getByText("ローズガーデン")).toBeInTheDocument();
  });
});
