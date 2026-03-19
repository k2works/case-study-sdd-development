import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import CustomerPage from "./page";

describe("CustomerPage", () => {
  it("花束商品一覧と注文導線を表示する", () => {
    render(<CustomerPage />);

    expect(
      screen.getByRole("heading", { level: 1, name: "花束を選んで注文する" }),
    ).toBeInTheDocument();

    const roseGarden = screen.getByRole("article", { name: "ローズガーデン" });
    expect(within(roseGarden).getByText("ローズガーデン")).toBeInTheDocument();
    expect(
      within(roseGarden).getByRole("link", { name: "この花束を注文する" }),
    ).toHaveAttribute("href", "/customer/order?product=rose-garden");

    const seasonal = screen.getByRole("article", { name: "季節のミモザブーケ" });
    expect(within(seasonal).getByText("季節のミモザブーケ")).toBeInTheDocument();
    expect(
      within(seasonal).getByRole("link", { name: "この花束を注文する" }),
    ).toHaveAttribute("href", "/customer/order?product=seasonal-mimosa");
  });
});
