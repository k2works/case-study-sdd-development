import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import CustomerPage from "./page";

describe("CustomerPage", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [
          {
            productId: "rose-garden",
            productName: "ローズガーデン プレミアム",
            description: "赤バラを増量した上位版ブーケです。",
            price: 6800,
          },
          {
            productId: "seasonal-mimosa",
            productName: "季節のミモザブーケ",
            description: "旬のミモザを主役にした、春の贈り物向けの花束です。",
            price: 4800,
          },
        ],
      }),
    );
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("花束商品一覧と注文導線を表示する", async () => {
    render(<CustomerPage />);

    expect(
      screen.getByRole("heading", { level: 1, name: "花束を選んで注文する" }),
    ).toBeInTheDocument();

    const roseGarden = await screen.findByRole("article", { name: "ローズガーデン プレミアム" });
    expect(within(roseGarden).getByText("ローズガーデン プレミアム")).toBeInTheDocument();
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
