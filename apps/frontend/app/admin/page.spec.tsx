import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import AdminPage from "./page";

describe("AdminPage", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((input: RequestInfo | URL) => {
        const url = String(input);

        if (url.endsWith("/admin/orders/ORD-1001")) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              orderId: "ORD-1001",
              customerName: "青山フラワー",
              productName: "ローズガーデン",
              deliveryDate: "2026-04-10",
              shippingDate: "2026-04-09",
              status: "confirmed",
              deliveryAddress: "東京都港区南青山 1-2-3",
            }),
          });
        }

        return Promise.resolve({
          ok: true,
          json: async () => [
            {
              orderId: "ORD-1001",
              customerName: "青山フラワー",
              productName: "ローズガーデン",
              deliveryDate: "2026-04-10",
              shippingDate: "2026-04-09",
              status: "confirmed",
            },
            {
              orderId: "ORD-1002",
              customerName: "表参道ギャラリー",
              productName: "ホワイトリリー",
              deliveryDate: "2026-04-12",
              shippingDate: "2026-04-11",
              status: "shipping-prep",
            },
          ],
        });
      }),
    );
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("受注一覧に主要項目を表示する", async () => {
    render(<AdminPage />);

    expect(
      await screen.findByRole("heading", { level: 1, name: "受注一覧" }),
    ).toBeInTheDocument();
    expect(screen.getByText("ORD-1001")).toBeInTheDocument();
    expect(screen.getByText("青山フラワー")).toBeInTheDocument();
    expect(screen.getByText("ローズガーデン")).toBeInTheDocument();
    expect(screen.getByText("2026-04-10")).toBeInTheDocument();
    expect(screen.getByText("confirmed")).toBeInTheDocument();
  });

  it("一覧の受注を選択すると詳細を表示する", async () => {
    render(<AdminPage />);

    fireEvent.click(await screen.findByRole("button", { name: "ORD-1001 の詳細を表示" }));

    expect(
      await screen.findByRole("heading", { level: 2, name: "受注詳細" }),
    ).toBeInTheDocument();
    expect(screen.getByText("東京都港区南青山 1-2-3")).toBeInTheDocument();
    expect(screen.getByText("2026-04-09")).toBeInTheDocument();
  });

  it("絞り込み結果が 0 件なら空状態を表示する", async () => {
    render(<AdminPage />);

    fireEvent.change(await screen.findByLabelText("顧客名"), {
      target: { value: "存在しない顧客" },
    });

    await waitFor(() => {
      expect(screen.getByText("条件に一致する受注はありません。")).toBeInTheDocument();
    });
  });
});
